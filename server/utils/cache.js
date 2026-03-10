let redisClient = null;
let useRedis = false;

const memoryCache = new Map();
const sequenceMap = new Map();

const now = () => Date.now();

const metrics = {
  gets: 0,
  hits: 0,
  misses: 0,
  staleHits: 0,
  sets: 0,
  dels: 0,
  errors: 0,
  totalGetLatencyMs: 0,
  totalSetLatencyMs: 0,
  totalDelLatencyMs: 0,
};

const withLatency = async (type, fn) => {
  const start = now();
  try {
    return await fn();
  } finally {
    const elapsed = now() - start;
    if (type === 'get') metrics.totalGetLatencyMs += elapsed;
    if (type === 'set') metrics.totalSetLatencyMs += elapsed;
    if (type === 'del') metrics.totalDelLatencyMs += elapsed;
  }
};

const toEnvelope = (value, freshSeconds, staleSeconds) => ({
  __cacheEnvelope: true,
  value,
  freshUntil: now() + freshSeconds * 1000,
  staleUntil: now() + staleSeconds * 1000,
});

const normalizeEnvelope = (raw) => {
  if (!raw) return null;
  if (raw.__cacheEnvelope) return raw;

  // Backward compatibility for old cached values
  return {
    __cacheEnvelope: true,
    value: raw,
    freshUntil: now() + 1000,
    staleUntil: now() + 1000,
  };
};

const initCache = async () => {
  const redisUrlRaw = process.env.REDIS_URL;
  const redisUrl =
    redisUrlRaw && redisUrlRaw.includes('upstash.io') && redisUrlRaw.startsWith('redis://')
      ? redisUrlRaw.replace('redis://', 'rediss://')
      : redisUrlRaw;
  if (!redisUrl) {
    console.log('ℹ️ Cache: REDIS_URL not set, using in-memory cache');
    return;
  }

  try {
    // Lazy require so server still works if redis package is not installed
    // eslint-disable-next-line global-require
    const { createClient } = require('redis');
    redisClient = createClient({ url: redisUrl });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    await redisClient.connect();
    useRedis = true;
    console.log('✅ Redis cache connected');
  } catch (err) {
    console.error('❌ Redis init failed, using memory cache:', err.message);
  }
};

const cacheGet = async (key) => {
  const result = await cacheGetSWR(key);
  return result.status === 'miss' ? null : result.value;
};

const cacheSet = async (key, value, ttlSeconds = 30) => {
  await cacheSetSWR(key, value, ttlSeconds, ttlSeconds);
};

const cacheGetSWR = async (key) => {
  metrics.gets += 1;

  try {
    if (useRedis && redisClient) {
      const raw = await withLatency('get', async () => redisClient.get(key));
      if (!raw) {
        metrics.misses += 1;
        return { status: 'miss', value: null };
      }

      const envelope = normalizeEnvelope(JSON.parse(raw));
      if (!envelope) {
        metrics.misses += 1;
        return { status: 'miss', value: null };
      }

      if (envelope.freshUntil > now()) {
        metrics.hits += 1;
        return { status: 'fresh', value: envelope.value };
      }

      if (envelope.staleUntil > now()) {
        metrics.staleHits += 1;
        return { status: 'stale', value: envelope.value };
      }

      metrics.misses += 1;
      return { status: 'miss', value: null };
    }

    const envelope = memoryCache.get(key);
    if (!envelope) {
      metrics.misses += 1;
      return { status: 'miss', value: null };
    }

    if (envelope.staleUntil <= now()) {
      memoryCache.delete(key);
      metrics.misses += 1;
      return { status: 'miss', value: null };
    }

    if (envelope.freshUntil > now()) {
      metrics.hits += 1;
      return { status: 'fresh', value: envelope.value };
    }

    metrics.staleHits += 1;
    return { status: 'stale', value: envelope.value };
  } catch (err) {
    metrics.errors += 1;
    metrics.misses += 1;
    return { status: 'miss', value: null };
  }
};

const cacheSetSWR = async (key, value, freshSeconds = 30, staleSeconds = 60) => {
  const staleTtl = Math.max(staleSeconds, freshSeconds);
  const envelope = toEnvelope(value, freshSeconds, staleTtl);
  metrics.sets += 1;

  if (useRedis && redisClient) {
    await withLatency('set', async () => redisClient.setEx(key, staleTtl, JSON.stringify(envelope)));
    return;
  }

  await withLatency('set', async () => {
    memoryCache.set(key, envelope);
  });
};

const cacheDel = async (key) => {
  metrics.dels += 1;
  if (useRedis && redisClient) {
    await withLatency('del', async () => redisClient.del(key));
    return;
  }

  await withLatency('del', async () => {
    memoryCache.delete(key);
  });
};

const cacheDelByPrefix = async (prefix) => {
  metrics.dels += 1;
  if (useRedis && redisClient) {
    const keys = await withLatency('get', async () => redisClient.keys(`${prefix}*`));
    if (keys.length) {
      await withLatency('del', async () => redisClient.del(keys));
    }
    return;
  }

  await withLatency('del', async () => {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  });
};

const nextSequence = async (name = 'default') => {
  if (useRedis && redisClient) {
    return withLatency('set', async () => redisClient.incr(`seq:${name}`));
  }

  const curr = sequenceMap.get(name) || now();
  const next = curr + 1;
  sequenceMap.set(name, next);
  return next;
};

const getCacheMetrics = () => {
  const totalLookups = metrics.hits + metrics.staleHits + metrics.misses;

  return {
    provider: useRedis ? 'redis' : 'memory',
    connected: useRedis,
    gets: metrics.gets,
    hits: metrics.hits,
    staleHits: metrics.staleHits,
    misses: metrics.misses,
    sets: metrics.sets,
    dels: metrics.dels,
    errors: metrics.errors,
    hitRate: totalLookups ? Number(((metrics.hits + metrics.staleHits) / totalLookups).toFixed(4)) : 0,
    missRate: totalLookups ? Number((metrics.misses / totalLookups).toFixed(4)) : 0,
    avgGetLatencyMs: metrics.gets ? Number((metrics.totalGetLatencyMs / metrics.gets).toFixed(2)) : 0,
    avgSetLatencyMs: metrics.sets ? Number((metrics.totalSetLatencyMs / metrics.sets).toFixed(2)) : 0,
    avgDelLatencyMs: metrics.dels ? Number((metrics.totalDelLatencyMs / metrics.dels).toFixed(2)) : 0,
  };
};

module.exports = {
  initCache,
  cacheGet,
  cacheSet,
  cacheGetSWR,
  cacheSetSWR,
  cacheDel,
  cacheDelByPrefix,
  nextSequence,
  getCacheMetrics,
};
