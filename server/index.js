require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Url = require('./models/Url');
const { initCache, cacheDelByPrefix, cacheGetSWR, cacheSetSWR } = require('./utils/cache');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Initialize cache (Redis if REDIS_URL is set, fallback to memory)
initCache();

// Get location from IP
const getLocationFromIP = async (ip) => {
  try {
    // Skip for localhost/private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Local' };
    }

    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 3000
    });
    
    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        city: response.data.city || 'Unknown'
      };
    }
  } catch (err) {
    console.error('Geolocation error:', err.message);
  }
  
  return { country: 'Unknown', city: 'Unknown' };
};

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/url'));

// @route  GET /:code
// @desc   Redirect to original URL
app.get('/:code', async (req, res) => {
  try {
    const cacheKey = `redirect:${req.params.code}`;
    const cachedRedirect = await cacheGetSWR(cacheKey);

    const loadRedirect = async () => {
      const url = await Url.findOne({ shortCode: req.params.code });
      if (!url) return null;

      const payload = {
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
      };

      await cacheSetSWR(cacheKey, payload, 60, 300);
      return payload;
    };

    let redirectData = null;

    if (cachedRedirect.status === 'fresh') {
      redirectData = cachedRedirect.value;
    } else if (cachedRedirect.status === 'stale') {
      redirectData = cachedRedirect.value;
      loadRedirect().catch(() => {});
    } else {
      redirectData = await loadRedirect();
      if (!redirectData) {
        return res.status(404).json({ error: 'URL not found' });
      }
    }

    // Check expiry
    if (redirectData.expiresAt && new Date() > new Date(redirectData.expiresAt)) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Get client IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress;

    // Get location (non-blocking)
    const location = await getLocationFromIP(ip);

    // Track click without read-before-write query
    const updateResult = await Url.updateOne(
      { shortCode: req.params.code },
      {
        $inc: { clicks: 1 },
        $push: {
          clickHistory: {
            timestamp: new Date(),
            referrer: req.headers.referer || 'Direct',
            ip: ip,
            country: location.country,
            city: location.city,
            userAgent: req.headers['user-agent'] || 'Unknown',
          },
        },
      }
    );

    if (!updateResult.matchedCount) {
      await cacheDelByPrefix(`redirect:${req.params.code}`);
      return res.status(404).json({ error: 'URL not found' });
    }

    await cacheDelByPrefix('urls:');
    await cacheDelByPrefix(`stats:${req.params.code}`);

    return res.redirect(redirectData.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
