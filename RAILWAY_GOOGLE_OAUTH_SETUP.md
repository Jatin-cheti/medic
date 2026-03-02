# Railway Google OAuth Setup & Testing Guide

## 🎯 What We Just Fixed

✅ **Migrations Completed**: All 20 database tables created on Railway  
✅ **Data Seeded**: Roles, languages, specialties, document types, payment methods  
✅ **Redis Made Optional**: App won't crash without Redis  
✅ **Google OAuth Credentials Added**: Ready to test  
✅ **Pushed to GitHub**: Railway auto-deploying now (commit `c940724`)

---

## 🔑 Step 1: Add Google OAuth Credentials to Railway

### Method 1: Railway Dashboard (Quickest)

1. Go to [railway.app](https://railway.app) → Your Project → **Backend service**
2. Click **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

4. Click **"Deploy"** (or wait for auto-deploy to finish)

### Method 2: Railway CLI

```powershell
cd "c:\Users\NEHA\OneDrive\Desktop\Medic\node"

railway variables set GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

railway variables set GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

---

## 📊 Step 2: MongoDB Disk Space Issue (Optional Fix)

Your logs show MongoDB connected but has low disk space:
```
available disk space of 233926656 bytes (223 MB)
required minimum: 524288000 bytes (500 MB)
```

### Option A: Ignore for Now (Recommended)
MongoDB is **optional** - your app works without it. Only needed for advanced messaging features.

### Option B: Upgrade Railway MongoDB (If You Need Messaging)
1. Railway → MongoDB service → Settings
2. Check "Volume Size" - Railway free tier has limited space
3. Consider using **MongoDB Atlas M0** (completely free, 512 MB):
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Get connection string
   - Update Railway variable: `MONGO_URL=<your-atlas-url>`

---

## 🧪 Step 3: Test Your Backend

### Get Your Railway Backend URL

```powershell
cd "c:\Users\NEHA\OneDrive\Desktop\Medic\node"
railway domain
```

**Example output:** `https://medic-backend-production.up.railway.app`

---

### Test 1: Health Check

```powershell
# Replace with your Railway URL
$BACKEND_URL = "https://your-backend-url.railway.app"

curl $BACKEND_URL
```

**Expected:**
```json
{"status":"ok","time":"2026-03-02T..."}
```

---

### Test 2: Patient Signup

```powershell
$body = @{
    email = "test$(Get-Random)@example.com"
    password = "Test123!"
    firstName = "John"
    lastName = "Doe"
    phone = "1234567890"
    gender = "Male"
    preferredLanguage = "en"
} | ConvertTo-Json

curl -Method POST -Uri "$BACKEND_URL/api/auth/patient/signup" `
     -ContentType "application/json" `
     -Body $body
```

**Expected:**
```json
{
  "user": { "uuid": "...", "email": "...", "role": "patient" },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### Test 3: Patient Login

```powershell
$loginBody = @{
    email = "test@example.com"  # Use email from signup
    password = "Test123!"
} | ConvertTo-Json

curl -Method POST -Uri "$BACKEND_URL/api/auth/patient/login" `
     -ContentType "application/json" `
     -Body $loginBody
```

**Expected:**
```json
{
  "user": { "uuid": "...", "email": "..." },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### Test 4: Get Dashboard Data (Protected Route)

```powershell
# Use token from login response
$TOKEN = "eyJhbGc..."  # Replace with actual token

curl -Uri "$BACKEND_URL/api/dashboard" `
     -Headers @{ "Authorization" = "Bearer $TOKEN" }
```

**Expected:**
```json
{
  "totalDoctors": 0,
  "totalSpecialties": 7,
  "recentAppointments": [],
  ...
}
```

---

### Test 5: Google OAuth (Browser Test)

1. **Get backend URL** and update Google OAuth console:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Select your OAuth 2.0 Client ID
   - **Authorized redirect URIs**: Add these:
     ```
     https://your-backend-url.railway.app/api/auth/google/callback
     http://localhost:4200/auth/patient-login
     ```

2. **Test Google OAuth flow**:
   ```
   https://your-backend-url.railway.app/api/auth/google
   ```
   
3. You should be redirected to Google Sign-In page
4. After login, redirected back to your callback URL

---

## 🐛 Troubleshooting

### Issue: "Railway deployment failing"

**Check logs:**
```powershell
railway logs
```

**Look for:**
- ✅ `Sequelize: Connection established.` (MySQL working)
- ⚠️  `MongoDB connected to mongodb://***...` (Optional - can fail)
- ✅ `Socket.IO initialized` (WebSocket ready)
- ✅ `Server listening on http://localhost:8080`

### Issue: "404 Not Found on endpoints"

**Check your backend URL:**
- Correct: `https://your-url.railway.app/api/auth/patient/signup`
- Wrong: `https://your-url.railway.app/auth/patient/signup` (missing `/api`)

### Issue: "JWT token invalid"

**Verify Railway variables:**
```powershell
railway variables
```

Should show:
```
JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
```

### Issue: MongoDB Atlas M0 Signup Required

**No credit card needed!** Steps:
1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (free, no credit card)
3. Create **M0 Free** cluster (512 MB, permanent free tier)
4. Database Access → Add user: `medicUser` / `<password>`
5. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere)
6. Get connection string: `mongodb+srv://medicUser:<password>@cluster0.xxxxx.mongodb.net/medicdb`
7. Railway → Backend → Variables → Update `MONGO_URL`

### Issue: Redis Errors

**Ignore them!** Redis is optional. Your app works without it. Redis is only for:
- Multi-server Socket.IO synchronization
- Session storage (future feature)

---

## 📋 Railway Environment Variables Checklist

Make sure these are set in Railway Backend service:

```env
# Required
NODE_ENV=production
JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
DATABASE_URL=<Railway MySQL service reference>

# Google OAuth (NEW)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Optional
MONGO_URL=<Railway MongoDB or MongoDB Atlas>
REDIS_URL=<Railway Redis, if you add it>
FRONTEND_ORIGIN=<Your frontend URL when deployed>
SEQUELIZE_LOG=false
```

---

## 🎯 Next Steps

After testing backend:

1. ✅ **Backend URL confirmed working**
2. ✅ **All endpoints tested (signup, login, dashboard)**
3. 🔜 **Deploy Frontend to Vercel/Railway**:
   - Update `angular/medic/src/environments/environment.prod.ts`
   - Set `apiUrl` to your Railway backend URL
   - Deploy frontend
4. 🔜 **Update Railway FRONTEND_ORIGIN**:
   - After frontend deployed, update variable
   - `FRONTEND_ORIGIN=https://your-frontend-url.vercel.app`
5. 🔜 **Test End-to-End**:
   - Signup → Login → Dashboard → Google OAuth

---

## 🆘 Need Help?

**Check Backend Logs:**
```powershell
railway logs --service backend
```

**Check MySQL Logs:**
```powershell
railway logs --service mysql
```

**Common Issues:**
- 502 Bad Gateway → Backend crashed, check logs
- 401 Unauthorized → JWT token expired or invalid
- 404 Not Found → Endpoint path wrong (check `/api` prefix)
- 500 Server Error → Database connection issue or migration not run

---

## ✅ Success Checklist

- [ ] Railway backend deployed (latest commit `c940724`)
- [ ] Migrations completed (20 tables created)
- [ ] Seed data inserted (roles, languages, specialties)
- [ ] Google OAuth credentials added to Railway
- [ ] Backend URL obtained and tested
- [ ] Health check returns `{"status":"ok"}`
- [ ] Patient signup works (returns token)
- [ ] Patient login works (returns token)
- [ ] Dashboard endpoint works (with token)
- [ ] Google OAuth redirect works (browser test)

**Ready to continue?** Run the tests above and share your backend URL! 🚀
