# Deploy to Railway - Complete Guide

Railway is the easiest free option. It includes MySQL, Redis, and your Node.js backend all in one place.

## Step 1: Create Railway Account (2 minutes)

1. Go to [railway.app](https://railway.app)
2. Click "Start New Project"
3. Sign up with GitHub (easiest option)
4. Authorize Railway to access your GitHub account

---

## Step 2: Create a New Project in Railway (1 minute)

1. After login, click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository (if not shown, click "Configure GitHub App" and authorize)
4. Select the `medic` or your repo name

---

## Step 3: Add Databases to Railway (3 minutes)

### Add MySQL Database

1. Click the "+" icon or "New" button in your project
2. Search for "MySQL" 
3. Click "MySQL"
4. Select "Add MySQL"
5. Wait for it to initialize (takes 1-2 minutes)

### Add Redis

1. Click the "+" icon again
2. Search for "Redis"
3. Select "Redis"
4. Click "Add Redis"
5. Wait for it to initialize

---

## Step 4: Deploy Backend Service (2 minutes)

1. Click the "+" icon again
2. Select "GitHub Repo"
3. Select your repository again
4. Railway will auto-detect it's a Node.js project
5. **Important**: Set "Root Directory" to `node`
6. Set Build Command: `npm install && npm run build`
7. Set Start Command: `node dist/index.js`
8. Click "Deploy"

---

## Step 5: Configure Environment Variables (2 minutes)

1. In Railway dashboard, select your **backend service** (the one you just deployed)
2. Go to "Variables" tab
3. Click "Raw Editor"
4. Paste the following:

```
NODE_ENV=production
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=another_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://your-frontend-url.vercel.app
LOG_LEVEL=debug
```

5. **Where to find database URLs**:
   - Go to your MySQL service → Variables tab → copy `DATABASE_URL`
   - Go to your Redis service → Variables tab → copy `REDIS_URL`
   - Go to your MongoDB (create separately or use MongoDB Atlas free M0)

6. Add these to your backend service variables:
   - Add `DATABASE_URL=<from_mysql_service>`
   - Add `REDIS_URL=<from_redis_service>`
   - Add `MONGO_URL=<from_mongodb_atlas>`

---

## Step 6: Run Migrations on Railway (3 minutes)

### Option A: Using Railway CLI (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Link to your Railway project
railway link

# 4. Run migrations
railway run node run-migrations.js

# 5. Seed data
railway run node seed-data.js

# 6. Check if migrations worked
railway run node -e "console.log('Railway is working!')"
```

### Option B: Using Railway Dashboard (No CLI)

1. Go to Railway dashboard
2. Select your **backend service**
3. Go to "Logs" tab
4. Click "Deploy" button to trigger a new deployment
5. The service will start - now run migrations remotely:
   - Go to your backend service
   - Click the "..." menu (three dots)
   - Select "Open Railway Shell"
   - Run: `node run-migrations.js`
   - Run: `node seed-data.js`

---

## Step 7: Get Your Backend URL

1. Go to your backend service in Railway
2. Go to "Settings" tab
3. Look for "Domains" section - you'll see your public URL like:
   ```
   https://your-app-name.railway.app
   ```
4. Copy this URL - you'll need it for the frontend

---

## Step 8: Test Your Backend

```bash
# Test if backend is running
curl https://your-app-name.railway.app/

# Test patient signup
curl -X POST https://your-app-name.railway.app/api/auth/patient/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe","phone":"1234567890","gender":"Male","preferredLanguage":"en"}'

# Test Google OAuth endpoint
curl -X POST https://your-app-name.railway.app/api/auth/google-test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@google.com","firstName":"Google","lastName":"User"}'
```

---

## Step 9: Deploy Frontend to Vercel

Now update your frontend to use the Railway backend URL:

```bash
# Go to frontend directory
cd angular/medic

# Update environment.prod.ts with your Railway URL
# Change apiUrl from localhost:3000 to https://your-app-name.railway.app
```

Edit `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-app-name.railway.app'  // Your Railway backend URL
};
```

Then deploy:
```bash
# Install Vercel CLI if not already done
npm install -g vercel

# Deploy to production
vercel --prod
```

---

## Complete Railway CLI Commands Reference

```bash
# Installation and Setup
npm install -g @railway/cli              # Install Railway CLI
railway login                             # Login to Railway
railway init                              # Initialize new project
railway link                              # Link to existing project

# Add Services
railway add                                # Add service (database, etc)

# View Project
railway status                             # Show project status
railway list                               # List all services
railway logs                               # View logs

# Run Commands
railway run npm install                   # Run command in service
railway run node run-migrations.js        # Run migrations
railway run node seed-data.js            # Seed data
railway run node -e "console.log('test')" # Run any Node command

# Variables
railway variables                         # List environment variables
railway variables set KEY=VALUE          # Set variable
railway variables unset KEY               # Remove variable

# Deployment
railway deploy                             # Deploy current service
railway up                                 # Deploy and show logs

# Get Info
railway domain                             # Get public URL
railway provider                          # Show database provider info
```

---

## Common Issues & Solutions

### Issue: "Can't connect to database"
**Solution**: 
1. Go to MySQL service → Variables tab
2. Copy the full DATABASE_URL
3. Add it to your backend service Variables
4. Redeploy (click Deploy button)

### Issue: "Migrations not running"
**Solution**:
1. Make sure `run-migrations.js` file exists in `node/` directory
2. Run: `railway run ls -la run-migrations.js`
3. Run: `railway run node run-migrations.js`
4. Check logs with: `railway logs`

### Issue: "Node modules not installed"
**Solution**:
1. In Railway dashboard, go to your service
2. Click "..." menu → "Rebuild"
3. Wait for build to complete

### Issue: "Port already in use"
**Solution**: 
Railway automatically assigns PORT=3000. You don't need to change anything. The environment variable is set automatically.

---

## Free Monthly Limits (Railway)

With $5 free credit:
- **Compute**: ~500 hours/month
- **Databases**: Included in credit
- **Bandwidth**: Included in credit

This is **plenty for a starter app**. Your app will cost less than $1/month.

---

## Next Steps

1. ✅ Create Railway account
2. ✅ Add databases (MySQL + Redis)
3. ✅ Deploy backend service
4. ✅ Set environment variables
5. ✅ Run migrations: `railway run node run-migrations.js`
6. ✅ Seed data: `railway run node seed-data.js`
7. ✅ Test backend with curl commands above
8. ✅ Deploy frontend to Vercel with Railway URL

Done! Your app will be live.

---

## Need Help?

- Railway Docs: https://docs.railway.app
- CLI Docs: https://docs.railway.app/reference/cli-api
- Support: https://railway.app/support
