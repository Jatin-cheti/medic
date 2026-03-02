# Railway Database Configuration - Quick Guide

## 🎯 Which Variables to Use

### For MySQL (Backend App)

Your backend code looks for these variables in order:
1. `DATABASE_URL` (first choice)
2. `MYSQL_URL` (second choice)
3. `MYSQLDATABASE_URL` (third choice)

**✅ Solution: Use `MYSQL_URL`**

### For MongoDB (Backend App)

Your backend code looks for these variables:
1. `MONGO_URL` (first choice)
2. `MONGODB_URL` (second choice)

**✅ Solution: Use `MONGO_URL`**

---

## 📋 Step-by-Step: Configure Backend Variables

### 1. Go to Railway Dashboard

1. Open [railway.app](https://railway.app)
2. Select your project: **"capable-nature"**
3. Click on your **Backend service** (NOT MySQL or MongoDB)
4. Click **"Variables"** tab

---

### 2. Add MySQL Connection

Click **"+ New Variable"** → **"Add Reference"**

**Select:**
- **Service**: MySQL
- **Variable**: `MYSQL_URL`

This creates:
```
MYSQL_URL = ${{MySQL.MYSQL_URL}}
```

**✅ This gives your backend the private MySQL connection string**

---

### 3. Add MongoDB Connection (Optional - for messaging features)

Click **"+ New Variable"** → **"Add Reference"**

**Select:**
- **Service**: MongoDB
- **Variable**: `MONGO_URL`

This creates:
```
MONGO_URL = ${{MongoDB.MONGO_URL}}
```

**⚠️ Note:** If you're getting "disk space" errors, MongoDB is optional. Skip this for now.

---

### 4. Add Google OAuth Credentials

Click **"+ New Variable"** (manual entry, NOT reference)

**Add these two:**

```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

---

## 📊 Complete Backend Variables Checklist

After setup, your **Backend service → Variables** should show:

### Required Variables ✅
```
NODE_ENV = production
JWT_SECRET = 8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_REFRESH_SECRET = 39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
JWT_EXPIRES_IN = 24h
JWT_REFRESH_EXPIRES_IN = 7d
SEQUELIZE_LOG = false
```

### Database References ✅
```
MYSQL_URL = ${{MySQL.MYSQL_URL}}  ← Reference to MySQL service
```

### Google OAuth ✅
```
GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
```

### Optional Variables (Add if needed)
```
MONGO_URL = ${{MongoDB.MONGO_URL}}  ← Reference to MongoDB service (if you added one)
REDIS_URL = ${{Redis.REDIS_URL}}  ← Reference to Redis service (if you added one)
FRONTEND_ORIGIN = https://your-frontend-url.vercel.app  ← Add after frontend deployed
```

---

## 🔍 Why These Specific Variable Names?

Your backend code (`node/src/services/sequelize.ts`) checks for variables in this order:

```typescript
// First tries DATABASE_URL
const envDatabaseUrl = firstNonEmpty(
  process.env.DATABASE_URL,
  process.env.MYSQL_URL,        ← Railway provides this
  process.env.MYSQLDATABASE_URL
);

// Then tries individual components
const dbHost = firstNonEmpty(
  process.env.DB_HOST, 
  process.env.MYSQLHOST         ← Railway provides this too
) || '127.0.0.1';
```

**Railway MySQL service provides:**
- ✅ `MYSQL_URL` - Full connection string (use this!)
- `MYSQL_PUBLIC_URL` - Public access (avoid, uses more resources)
- `MYSQL_DATABASE` - Just database name
- `MYSQLHOST` - Just hostname
- `MYSQLDATABASE` - Alternate database name

**Use `MYSQL_URL` because it's a complete connection string with:**
- Username
- Password
- Host (internal private network)
- Port
- Database name

---

## 🚀 After Adding Variables

1. **Railway will auto-redeploy** your backend (~2 minutes)

2. **Check deployment logs**:
   - Go to Backend service → **Deployments** → Latest
   - Click **"View Logs"**
   
3. **Look for success messages:**
   ```
   ✅ Using database URL from environment.
   ✅ Sequelize resolved host: mysql.railway.internal port: 3306
   ✅ Sequelize: Connection established.
   ✅ Socket.IO initialized (single-server mode, no Redis)
   ✅ Server listening on http://localhost:8080
   ```

4. **Get your backend URL**:
   - Go to Backend service → **Settings** → **Networking** → **Public Networking**
   - Click **"Generate Domain"** if you don't have one
   - Copy the URL (e.g., `https://medic-backend-production-xxxx.up.railway.app`)

---

## 🧪 Test Your Backend

### Health Check
```powershell
# Replace with your Railway backend URL
curl https://your-backend-url.railway.app/
```

**Expected:**
```json
{"status":"ok","time":"2026-03-02T..."}
```

### Patient Signup
```powershell
$url = "https://your-backend-url.railway.app"

$body = @{
    email = "test$(Get-Random)@example.com"
    password = "Test123!"
    firstName = "John"
    lastName = "Doe"
    phone = "1234567890"
    gender = "Male"
    preferredLanguage = "en"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "$url/api/auth/patient/signup" `
     -ContentType "application/json" -Body $body
```

**Expected:**
```json
{
  "user": { "uuid": "...", "email": "...", "firstName": "John" },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find MySQL.MYSQL_URL"

**Solution:** Make sure you're adding the reference in the **Backend service**, not the MySQL service itself.

**Steps:**
1. Click **Backend service** (your Node.js app)
2. Variables tab
3. "+ New Variable" → "Add Reference"
4. Service dropdown → Select "MySQL"
5. Variable dropdown → Select "MYSQL_URL"

---

### Issue: "ENOTFOUND mysql.railway.internal"

**Cause:** Wrong variable name or Railway internal networking not enabled.

**Solution:**
1. Verify you added `MYSQL_URL` as a **reference** (not typed manually)
2. Check that reference shows as `${{MySQL.MYSQL_URL}}`
3. Redeploy backend service

---

### Issue: MongoDB disk space error

```
❌ available disk space of 233926656 bytes is less than required minimum of 524288000
```

**Solutions:**

**Option A - Ignore for Now (Recommended)**
- MongoDB is optional
- Your app works without it
- Only needed for advanced messaging features

**Option B - Use MongoDB Atlas Free Tier**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create **M0 Free** cluster (512 MB, permanent free)
3. Get connection string
4. Add to Railway Backend variables manually:
   ```
   MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/medicdb
   ```

**Option C - Remove MongoDB from Railway**
- Your backend handles missing MongoDB gracefully
- Just don't add `MONGO_URL` variable

---

### Issue: JWT token errors

**Verify these are set:**
```
JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
```

**Check:**
```powershell
cd "c:\Users\NEHA\OneDrive\Desktop\Medic\node"
railway variables
```

---

## 📱 Visual Guide: Adding Service Reference

### Step 1: Backend Service → Variables
```
[Backend Service]
├── Settings
├── Deployments
├── Variables  ← Click here
├── Metrics
└── ...
```

### Step 2: Add New Variable
```
[Variables Tab]
┌─────────────────────────────────────┐
│ + New Variable    ▼                 │  ← Click this
│ ┌─────────────────────────────────┐ │
│ │ • Variable Name and Value       │ │
│ │ • Add Reference    ← Select     │ │
│ │ • Add from Service              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Step 3: Select Service & Variable
```
[Add Reference]
┌─────────────────────────────────────┐
│ Variable Name: MYSQL_URL            │
│                                      │
│ Service:  [MySQL        ▼]         │ ← Select MySQL
│ Variable: [MYSQL_URL    ▼]         │ ← Select MYSQL_URL
│                                      │
│           [Cancel]  [Add Variable]  │
└─────────────────────────────────────┘
```

### Result:
```
MYSQL_URL = ${{MySQL.MYSQL_URL}}
```

---

## ✅ Success Checklist

- [ ] Backend service → Variables tab opened
- [ ] Added `MYSQL_URL` as reference to MySQL.MYSQL_URL
- [ ] Added `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] (Optional) Added `MONGO_URL` as reference to MongoDB.MONGO_URL
- [ ] Railway auto-deployed backend (~2 minutes)
- [ ] Backend logs show "Connection established"
- [ ] Generated public domain for backend
- [ ] Health check endpoint returns `{"status":"ok"}`
- [ ] Patient signup works and returns token

---

## 🎯 Next Steps

After backend is running:

1. ✅ Test all endpoints (signup, login, dashboard, Google OAuth)
2. 🔜 Deploy frontend to Vercel/Railway
3. 🔜 Update `FRONTEND_ORIGIN` in backend variables
4. 🔜 Test end-to-end flow

**Ready to test?** Share your backend URL and let's verify everything works! 🚀
