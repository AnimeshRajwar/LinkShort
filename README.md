# ⚡ MERN URL Shortener

A full-stack URL shortener built with **MongoDB · Express · React · Node.js**.

![Stack](https://img.shields.io/badge/Stack-MERN-6c63ff?style=flat-square)

---

## Features

- 🔗 Shorten any URL instantly
- ✏️ Custom short codes (e.g. `/my-link`)
- ⏳ Optional link expiration (set in days)
- 📊 Click tracking with history
- 🗑️ Delete links
- 📋 One-click copy to clipboard
- 📱 Responsive design

---

## Project Structure

```
url-shortener/
├── server/                  # Express + MongoDB API
│   ├── models/
│   │   └── Url.js           # Mongoose schema
│   ├── routes/
│   │   └── url.js           # API routes
│   ├── index.js             # Server entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ShortenForm.jsx
│   │   │   ├── UrlTable.jsx
│   │   │   └── StatsBar.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── package.json             # Root scripts
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

### 3. Run in Development

```bash
# From root — runs both server and client
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:5000

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/shorten` | Create a short URL |
| `GET` | `/api/urls` | List all URLs |
| `GET` | `/api/stats/:code` | Get stats for a URL |
| `DELETE` | `/api/urls/:code` | Delete a URL |
| `GET` | `/:code` | Redirect to original URL |

### POST `/api/shorten`

```json
{
  "originalUrl": "https://example.com/very/long/path",
  "customCode": "my-link",   // optional
  "expiresIn": "30"          // optional, days
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:5000/my-link",
  "shortCode": "my-link",
  "originalUrl": "https://example.com/very/long/path",
  "clicks": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-31T00:00:00.000Z"
}
```

---

## Deployment

### Deploy to Production

1. Build the React app:
   ```bash
   npm run build
   ```

2. Serve the build folder from Express (add to `server/index.js`):
   ```js
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../client/build')));
   app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
   ```

3. Set `BASE_URL` to your production domain in `.env`.

### Recommended Platforms
- **MongoDB**: MongoDB Atlas (free tier)
- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel or Netlify (or serve from Express)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Database | MongoDB + Mongoose |
| Backend | Node.js + Express |
| Frontend | React 18 |
| HTTP Client | Axios |
| ID Generation | nanoid |
| URL Validation | valid-url |
