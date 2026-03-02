# Free Deployment Guide - No Credit Card Required

## 🆓 100% Free Options

### Option 1: Railway (Recommended - Easiest)

Railway provides $5/month free credit and hosts everything together.

#### Setup Railway (5 minutes)

1. **Sign up**: Go to [railway.app](https://railway.app) → Sign up with GitHub
2. **Create New Project** → "Deploy from GitHub repo"
3. **Add MySQL Database**: 
   - Click "New" → "Database" → "Add MySQL"
4. **Add Redis**:
   - Click "New" → "Database" → "Add Redis"
5. **Deploy Backend**:
   - Connect your GitHub repo
   - Set root directory to `node`
   - Railway auto-detects Node.js

#### Environment Variables for Railway

Railway will auto-populate database URLs. Just add:

```
NODE_ENV=production
JWT_SECRET=your_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_other_secret_min_32_chars
FRONTEND_ORIGIN=https://your-frontend.vercel.app
```

#### Run Migrations on Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run node run-migrations.js
railway run node seed-data.js
```

---

### Option 2: Render (Another Free Option)

#### Setup Render (5 minutes)

1. **Sign up**: [render.com](https://render.com) → Sign up with GitHub
2. **Create PostgreSQL Database**:
   - "New +" → "PostgreSQL" → Choose "Free" tier
3. **Create Redis**:
   - "New +" → "Redis" → Choose "Free" tier
4. **Deploy Backend**:
   - "New +" → "Web Service"
   - Connect GitHub repo
   - Root Directory: `node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`

#### Environment Variables

Add in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=<from_render_postgres>
REDIS_URL=<from_render_redis>
MONGO_URL=<see_mongodb_free_alternative_below>
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_other_secret
```

---

### Option 3: Keep Running Locally (Deploy to VPS)

#### Use Oracle Cloud Free Tier
- **2 AMD VMs** free forever
- Sign up: [oracle.com/cloud/free](https://cloud.oracle.com/free)

#### Or Digital Ocean (Get $200 Credit)
- Sign up with student account or use referral
- $200 credit for 60 days
- [digitalocean.com](https://www.digitalocean.com)

---

## Free MongoDB Alternatives

### MongoDB Atlas IS Free!
Actually, MongoDB Atlas **does have a free tier** (M0):
- 512 MB storage
- Shared vCPU
- Forever free
- No credit card needed

**Steps:**
1. Sign up at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Choose "Shared" → "Free" (M0)
3. Create cluster (takes 5 minutes)
4. Get connection string

### Alternative: Use JSON Storage
For development, you can use:
- **JSONBin**: [jsonbin.io](https://jsonbin.io) - Free JSON storage
- Or skip MongoDB initially and use MySQL for everything

---

## Simplified Deployment: Deploy to Railway

### Quick Start (10 minutes total)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Add MySQL
railway add --plugin mysql

# 5. Add Redis  
railway add --plugin redis

# 6. Set environment variables
railway variables set JWT_SECRET="your_32_char_secret_here"
railway variables set JWT_REFRESH_SECRET="another_32_char_secret"

# 7. Deploy backend
cd node
railway up

# 8. Run migrations
railway run node run-migrations.js
railway run node seed-data.js

# 9. Get your backend URL
railway domain

# 10. Deploy frontend to Vercel (free)
cd ../angular/medic
vercel --prod
```

---

## Complete Free Stack (No Credit Card)

| Service | Provider | Free Tier |
|---------|----------|-----------|
| **Backend API** | Railway or Render | Yes (Railway: $5/mo credit, Render: 750 hours/mo) |
| **Frontend** | Vercel | Yes (unlimited hobby projects) |
| **MySQL** | Railway/Render | Yes (100MB Railway, 1GB Render) |
| **MongoDB** | MongoDB Atlas M0 | Yes (512MB forever) |
| **Redis** | Railway/Render | Yes (25MB Railway, 25MB Render) |

---

## Recommended Free Combo

**Best free setup for your app:**

1. **Backend + MySQL + Redis**: Railway (all in one, $5/mo credit is enough)
2. **MongoDB**: MongoDB Atlas M0 (actually free forever)
3. **Frontend**: Vercel (free forever)

**Total Cost: $0/month** ✅

---

## Alternative: Just Deploy to Vercel

Vercel can work with external databases. Let me create a setup that uses only free services:

### Minimal Free Setup

1. **Vercel** - Backend + Frontend
2. **MongoDB Atlas** - Free M0 cluster (actually free!)
3. **Upstash** - Free Redis (10K commands/day)
4. **Supabase** - Free PostgreSQL alternative to MySQL

All of these are actually free with no credit card required!

---

## I'll Help You Set Up Free Accounts

Would you like me to:

1. **Create a Railway deployment script** (easiest - everything in one place)
2. **Set up MongoDB Atlas** free tier (I'll walk you through it)
3. **Configure Supabase** as MySQL alternative
4. **Deploy entirely to Vercel** with cloud databases

Which option sounds best for you?

### Quick Action: Try Railway Now

Railway is the easiest free option. Would you like me to create the Railway deployment configuration files for you?
