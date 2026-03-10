# ⚡ LinkShort - URL Shortener

A modern, full-stack URL shortener with authentication, analytics, and Redis caching.

![Stack](https://img.shields.io/badge/Stack-MERN-6c63ff?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=flat-square)
![Cache](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat-square)

---

## Features

- 🔗 Shorten URLs with Base62 encoding
- 🔐 Authentication powered by Supabase
- 📊 Real-time analytics dashboard with click tracking
- 🌍 IP-based geolocation tracking
- ⚡ Redis caching with SWR (Stale-While-Revalidate) strategy
- 🔄 Real-time updates with 5-second polling
- ⏳ Optional link expiration (set in days)
- 🗑️ Delete links with confirmation
- 📋 One-click copy to clipboard
- 📱 Responsive design with tabs navigation
- 🎯 MongoDB indexes for optimized performance

---

## Project Structure

```
url-shortener/
├── server/                  # Express + MongoDB API
│   ├── models/
│   │   ├── Url.js          # Mongoose schema with indexes
│   │   └── User.js         # User schema (legacy)
│   ├── routes/
│   │   ├── url.js          # API routes with caching
│   │   └── auth.js         # Auth routes (legacy)
│   ├── middleware/
│   │   └── auth.js         # Supabase JWT verification
│   ├── utils/
│   │   └── cache.js        # Redis/Memory cache with SWR
│   ├── index.js            # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ShortenForm.jsx
│   │   │   ├── UrlTable.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── lib/
│   │   │ Atlas account (free tier)
- Supabase account (free tier)
- Upstash Redis account (optional, free tier)

### 1. Clone & Install

```bash
git clone https://github.com/AnimeshRajwar/LinkShort.git
cd LinkShort
npm run install:all
```

### 2. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:<password>@cluster.mongodb.net/urlshortener
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
REDIS_URL=rediss://default:<password>@your-redis.upstash.io:6379
```

### 3. Configure Frontend Environment

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```4. Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `client/.env`
3. Enable Email Auth in Supabase Dashboard → Authentication → Providers
4. Configure email templates for password reset

### 5. Run in Development

```bash
# From root — runs both server and client
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:5000

First-time startup shows:
- ✅ Redis cache connected (or fallback to memory)
- ✅ MongoDB connected
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```
