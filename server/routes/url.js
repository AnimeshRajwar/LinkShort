const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const Url = require('../models/Url');
const authMiddleware = require('../middleware/auth');
const {
  cacheGetSWR,
  cacheSetSWR,
  cacheDelByPrefix,
  nextSequence,
  getCacheMetrics,
} = require('../utils/cache');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Base62 encoding for URL shortening
const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const encodeBase62 = (num) => {
  if (num === 0) return BASE62[0];
  let encoded = '';
  while (num > 0) {
    encoded = BASE62[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded;
};

// @route  POST /api/shorten
// @desc   Shorten a URL
router.post('/shorten', authMiddleware, async (req, res) => {
  const { originalUrl, expiresIn } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
  }

  try {
    // Check if URL already shortened
    const existing = await Url.findOne({ originalUrl });
    if (existing) {
      return res.json({
        shortUrl: `${BASE_URL}/${existing.shortCode}`,
        shortCode: existing.shortCode,
        originalUrl: existing.originalUrl,
        clicks: existing.clicks,
        createdAt: existing.createdAt,
      });
    }

    // Generate short code
    let shortCode;

    // Generate base62 code from monotonic sequence (Redis INCR when available)
    // Retry a few times in case a legacy code collides
    let attempts = 0;
    do {
      const uniqueId = await nextSequence('url');
      shortCode = encodeBase62(uniqueId);
      // eslint-disable-next-line no-await-in-loop
      const exists = await Url.findOne({ shortCode });
      if (!exists) break;
      attempts += 1;
    } while (attempts < 5);

    if (attempts >= 5) {
      return res.status(500).json({ error: 'Failed to generate unique short code' });
    }

    // Set expiry
    let expiresAt = null;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      if (!isNaN(days) && days > 0) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    }

    const url = new Url({ originalUrl, shortCode, expiresAt });
    await url.save();

    await cacheDelByPrefix('urls:');
    await cacheDelByPrefix('stats:');
    await cacheDelByPrefix('redirect:');

    res.json({
      shortUrl: `${BASE_URL}/${shortCode}`,
      shortCode,
      originalUrl,
      clicks: 0,
      createdAt: url.createdAt,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route  GET /api/stats/:code
// @desc   Get stats for a short URL
router.get('/stats/:code', async (req, res) => {
  try {
    const cacheKey = `stats:${req.params.code}`;
    const loadStats = async () => {
      const url = await Url.findOne({ shortCode: req.params.code });
      if (!url) {
        return null;
      }

      const payload = {
        shortUrl: `${BASE_URL}/${url.shortCode}`,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt,
        clickHistory: url.clickHistory.slice(-20), // last 20
      };

      await cacheSetSWR(cacheKey, payload, 20, 120);
      return payload;
    };

    const cached = await cacheGetSWR(cacheKey);
    if (cached.status === 'fresh') {
      res.set('X-Cache', 'HIT');
      return res.json(cached.value);
    }

    if (cached.status === 'stale') {
      res.set('X-Cache', 'STALE');
      loadStats().catch(() => {});
      return res.json(cached.value);
    }

    const payload = await loadStats();
    if (!payload) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.set('X-Cache', 'MISS');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route  GET /api/urls
// @desc   Get all URLs (most recent 50)
router.get('/urls', authMiddleware, async (req, res) => {
  try {
    const cacheKey = 'urls:list';
    const loadUrls = async () => {
      const urls = await Url.find().sort({ createdAt: -1 }).limit(50);
      const payload = urls.map((u) => ({
        shortUrl: `${BASE_URL}/${u.shortCode}`,
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        createdAt: u.createdAt,
        expiresAt: u.expiresAt,
        clickHistory: u.clickHistory || [],
      }));

      await cacheSetSWR(cacheKey, payload, 10, 60);
      return payload;
    };

    const cached = await cacheGetSWR(cacheKey);
    if (cached.status === 'fresh') {
      res.set('X-Cache', 'HIT');
      return res.json(cached.value);
    }

    if (cached.status === 'stale') {
      res.set('X-Cache', 'STALE');
      loadUrls().catch(() => {});
      return res.json(cached.value);
    }

    const payload = await loadUrls();
    res.set('X-Cache', 'MISS');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// @route  GET /api/cache/metrics
// @desc   Cache metrics (hit rate, miss rate, latency)
router.get('/cache/metrics', authMiddleware, async (_req, res) => {
  return res.json(getCacheMetrics());
});

// @route  DELETE /api/urls/:code
// @desc   Delete a URL
router.delete('/urls/:code', authMiddleware, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: 'Not found' });

    await cacheDelByPrefix('urls:');
    await cacheDelByPrefix(`stats:${req.params.code}`);
    await cacheDelByPrefix(`redirect:${req.params.code}`);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
