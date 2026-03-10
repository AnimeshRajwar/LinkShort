const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  clickHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      referrer: String,
      ip: String,
      country: String,
      city: String,
      userAgent: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
});

// Indexes for performance at scale
// unique short code lookups
urlSchema.index({ shortCode: 1 }, { unique: true });

// recent-first listing optimization (/api/urls sorted by createdAt desc)
urlSchema.index({ createdAt: -1 });

// optional TTL strategy: auto-delete expired links when expiresAt is reached
// partial filter keeps non-expiring links (null expiresAt) untouched
urlSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $type: 'date' } },
  }
);

module.exports = mongoose.model('Url', urlSchema);
