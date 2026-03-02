# Vercel Deployment Guide for Medic Application

## ✅ Local Testing Complete

- All 20 end-to-end tests passing (100% pass rate)
- Google OAuth test endpoint functional
- Database migrations successful
- Reference data seeded

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Production MySQL**: Set up at [PlanetScale](https://planetscale.com) (recommended, free tier) or [Railway](https://railway.app)
3. **Production MongoDB**: Set up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
4. **Production Redis**: Set up at [Upstash](https://upstash.com) (free tier available)
5. **Git Repository**: Push your code to GitHub/GitLab

## Part 1: Set Up Production Databases

### MySQL (PlanetScale - Recommended)

1. Create account at planetscale.com
2. Create new database (e.g., "medic-prod")
3. Get connection string: Format `mysql://user:pass@host/database?sslaccept=strict`
4. Run migrations using the provided scripts (see below)

### MongoDB Atlas

1. Create account at mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/database`

### Upstash Redis

1. Create account at upstash.com
2. Create free Redis database
3. Get connection string: `redis://default:pass@endpoint:port`

## Part 2: Initialize Production Database

### Run Migrations on Production MySQL

```bash
# Set production database URL
$env:MIGRATION_DATABASE_URL="mysql://user:pass@host:port/database"

# Run migrations
node run-migrations.js

# Seed initial data
node seed-data.js
```

**What gets created:**
- 20 database tables
- Roles: patient, doctor, admin
- 5 languages (English, Hindi, Spanish, French, German)
- 7 medical specialties
- 4 document types
- 5 payment methods

## Part 3: Deploy Backend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend
cd node

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Set root directory to `node`
5. Add environment variables (see below)
6. Deploy

### Required Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
NODE_ENV=production
PORT=3000

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=<your_32_char_random_string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<your_32_char_random_string>
JWT_REFRESH_EXPIRES_IN=7d

# Database URLs
DATABASE_URL=<your_planetscale_connection_string>
MONGO_URL=<your_mongodb_atlas_connection_string>
REDIS_URL=<your_upstash_redis_connection_string>

# CORS
FRONTEND_ORIGIN=https://your-frontend.vercel.app

# Optional: Google OAuth
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_REDIRECT_URI=https://your-backend.vercel.app/api/auth/google/callback
```

## Part 4: Deploy Frontend to Vercel

```bash
# Navigate to Angular app
cd angular/medic

# Build production bundle
npm run build

# Deploy to Vercel
vercel --prod
```

### Frontend Environment Variables

Update `environment.prod.ts` or add build environment variable:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.vercel.app/api'
};
```

## Part 5: Test Deployment

### Test Backend Endpoints

```bash
# Health check
curl https://your-backend.vercel.app/

# Patient signup
curl -X POST https://your-backend.vercel.app/api/auth/patient/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe","phone":"1234567890","gender":"Male","preferredLanguage":"en"}'

# Login
curl -X POST https://your-backend.vercel.app/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Google test login
curl -X POST https://your-backend.vercel.app/api/auth/google-test \
  -H "Content-Type: application/json" \
  -d '{"email":"google@example.com","firstName":"Google","lastName":"User"}'
```

### Test Frontend

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Test patient signup
3. Test login
4. Test "Continue with Google" button (using test endpoint)
5. Verify dashboard loads

## Part 6: Configure Google OAuth (Production)

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `https://your-backend.vercel.app/api/auth/google/callback`
6. Save Client ID and Client Secret

### Update Environment Variables

Add to Vercel:
```
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
GOOGLE_REDIRECT_URI=https://your-backend.vercel.app/api/auth/google/callback
```

### Update Frontend

In `patient-login.component.ts`, update the `loginWithGoogle()` method to use the real OAuth flow instead of the test endpoint.

## Troubleshooting

### Deployment Issues

- **Build fails**: Check Node.js version matches (20.x)
- **Database connection**: Verify connection strings and whitelist Vercel IPs
- **CORS errors**: Ensure FRONTEND_ORIGIN matches your frontend URL
- **Missing tables**: Run migrations on production database

### Database Connection from Vercel

Vercel uses dynamic IPs. For databases:
- **PlanetScale**: No IP whitelist needed
- **MongoDB Atlas**: Whitelist 0.0.0.0/0
- **Upstash**: No IP whitelist needed

### View Logs

```bash
# View deployment logs
vercel logs <deployment-url>

# View runtime logs
vercel logs --follow
```

## Performance Optimization

1. **Enable caching**: Vercel automatically caches static assets
2. **Database connection pooling**: Already configured in Sequelize
3. **Redis caching**: Configured for Socket.IO presence
4. **CDN**: Vercel Edge Network handles this automatically

## Security Checklist

- ✅ Use strong JWT secrets (32+ characters)
- ✅ Enable HTTPS only (Vercel default)
- ✅ Set CORS to specific frontend origin
- ✅ Database credentials in environment variables
- ✅ No secrets committed to Git
- ✅ Rate limiting (consider adding)
- ✅ Input validation (already implemented)

## Next Steps After Deployment

1. Set up monitoring (Vercel Analytics)
2. Configure custom domain
3. Set up email service for notifications
4. Implement rate limiting
5. Add real-time messaging features
6. Set up automated backups

## Support

- Vercel Documentation: https://vercel.com/docs
- PlanetScale Docs: https://docs.planetscale.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Upstash Docs: https://docs.upstash.com
