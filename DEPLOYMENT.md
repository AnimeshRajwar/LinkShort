# Deployment Guide: Vercel + Render

## Prerequisites
- GitHub account with this repo pushed
- MongoDB Atlas cluster (already set up)
- Upstash Redis instance (already set up)

---

## Step 1: Deploy Backend on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

3. **Configure Service**
   - **Name**: `url-shortener-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node index.js`
   - **Plan**: Free

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/urlshortener
   BASE_URL=https://url-shortener-backend.onrender.com
   CLIENT_URL=https://your-app.vercel.app
   REDIS_URL=rediss://default:your-password@your-redis.upstash.io:6379
   ```

   **Important**: 
   - Use your actual MongoDB Atlas connection string
   - Use your actual Upstash Redis URL
   - `BASE_URL` will be your Render backend URL (you'll get this after deployment)
   - `CLIENT_URL` will be your Vercel frontend URL (you'll get this from Vercel)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Copy your backend URL: `https://url-shortener-backend.onrender.com`

---

## Step 2: Deploy Frontend on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   **Important**: Use your actual Supabase project URL and anon key from Supabase Dashboard

5. **Update vercel.json**
   - Before deploying, update `client/vercel.json`
   - Replace `your-backend-url.onrender.com` with your actual Render backend URL

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your frontend URL: `https://your-app.vercel.app`

---

## Step 3: Update Environment Variables

### On Render (Backend):
1. Go to your service dashboard
2. Click "Environment" tab
3. Update these values:
   - `CLIENT_URL=https://your-app.vercel.app` (your actual Vercel URL)
   - `BASE_URL=https://url-shortener-backend.onrender.com` (your actual Render URL)
4. Save changes (will auto-redeploy)

### On Vercel (Frontend):
1. Update `client/vercel.json` with your actual Render backend URL
2. Commit and push to GitHub (auto-deploys)

---

## Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try creating a short URL
3. Check that redirects work
4. Verify analytics tracking

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-50 seconds (cold start)
- 750 hours/month (enough for one always-on service)

**Vercel Free Tier:**
- Unlimited bandwidth
- 100 GB bandwidth/month
- Fast global CDN

### Cold Start Fix

To keep Render service awake, use a service like [Cron-job.org](https://cron-job.org):
- Create free account
- Add job: `GET https://url-shortener-backend.onrender.com/api/cache/metrics`
- Schedule: Every 10 minutes
- This pings your backend to prevent sleep

### MongoDB Atlas Network Access

Make sure MongoDB Atlas allows connections from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow all)
3. This is needed because Render uses dynamic IPs

### CORS Configuration

Already configured in `server/index.js`:
```javascript
app.use(cors({ origin: CLIENT_URL }));
```

Make sure `CLIENT_URL` env var matches your Vercel URL exactly.

---

## Troubleshooting

### Backend not connecting to MongoDB
- Check `MONGODB_URI` format and password encoding
- Verify MongoDB Atlas Network Access allows `0.0.0.0/0`

### Backend not connecting to Redis
- Verify Upstash Redis URL starts with `rediss://` (TLS)
- Check password is correct

### Frontend can't reach backend
- Check `vercel.json` has correct backend URL
- Verify CORS `CLIENT_URL` matches Vercel URL exactly
- Check backend is awake (visit backend URL directly)

### 404 on redirects
- Make sure `BASE_URL` env var on Render matches your actual Render URL

---

## Alternative: Deploy Both on Render

If you prefer one platform:

1. Deploy backend as Web Service (same as above)
2. Deploy frontend as Static Site:
   - New → Static Site
   - Root: `client`
   - Build: `npm run build`
   - Publish: `build`
   - No need for `vercel.json`

Both services on Render free tier work great for low-traffic apps.
