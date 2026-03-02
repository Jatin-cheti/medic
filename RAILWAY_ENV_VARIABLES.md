# Railway Environment Variables - Copy & Paste

## 🚀 Set These in Railway Backend Service

Go to Railway → Your Backend Service → **Variables** tab → Click "Raw Editor" → Paste these:

```
NODE_ENV=production
JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_ORIGIN=https://your-frontend-url.railway.app
SEQUELIZE_LOG=false
```

---

## 📊 Database Variables (Choose ONE Method)

### Method 1: Reference Railway MySQL Service (Recommended)

In Railway Variables UI:
1. Click **"New Variable"** → **"Add Reference"**
2. Select your **MySQL service**
3. Choose **DATABASE_URL**
4. Railway auto-fills when MySQL service exists

### Method 2: Manual DATABASE_URL (If You Have It)

If you already have the MySQL connection string:
```
DATABASE_URL=mysql://root:uSDQjwxcSXZwUjQucqZLrxyaGZODgyAz@mysql.railway.internal:3306/railway
```
**⚠️ Replace with YOUR actual MySQL URL from Railway MySQL service → Variables tab**

---

## 🔗 After Setting Variables

1. **Save** in Railway dashboard
2. Railway will **auto-redeploy** your backend
3. Watch the **Deploy Logs** for:
   - ✅ `Using database URL from environment.`
   - ✅ `Sequelize: Connection established.`
4. Get your backend URL from **Settings → Domains**

---

## 📝 Optional Variables (For Later)

### MongoDB (If You Use It)
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/medic
```
Use free **MongoDB Atlas M0** cluster.

### Redis (If You Use It)
```
REDIS_URL=redis://default:password@host:port
```
Or reference Railway Redis service if you created one.

### Google OAuth (When Ready)
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.railway.app/api/auth/google/callback
```

---

## ✅ Complete Railway Variables Checklist

**Required Now:**
- [x] `NODE_ENV=production`
- [x] `JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd`
- [x] `JWT_EXPIRES_IN=24h`
- [x] `JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480`
- [x] `JWT_REFRESH_EXPIRES_IN=7d`
- [x] `DATABASE_URL` (reference MySQL service)
- [ ] `FRONTEND_ORIGIN` (update after frontend deploys)

**Optional:**
- [ ] `MONGO_URL` (if using MongoDB)
- [ ] `REDIS_URL` (if using Redis)
- [ ] `GOOGLE_CLIENT_ID` (for OAuth)
- [ ] `GOOGLE_CLIENT_SECRET` (for OAuth)

---

## 🎯 Quick Copy-Paste for Railway

**Minimal Setup (Start Here):**
```
NODE_ENV=production
JWT_SECRET=8d6b4dc2b16a59462f9c837cb3366ac8d0f14cff1c890fd1693a41b39bbc2cbd
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=39b61d00f6aa82e6832008cb3ec9301f524b83aa390118db246d77189c275480
JWT_REFRESH_EXPIRES_IN=7d
SEQUELIZE_LOG=false
```

Then **add DATABASE_URL reference** via Railway UI.

---

## 🔒 Security Note

**These JWT secrets are production secrets - keep them private!**
- Don't commit these to GitHub
- Don't share publicly
- If exposed, regenerate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 📞 Need Help?

1. **Backend not connecting?**
   - Check Railway Logs: Backend service → Deployments → Click latest → View logs
   - Look for: `Using database URL from environment.`

2. **Database not found?**
   - Verify MySQL service exists in same Railway project
   - Check DATABASE_URL reference is correct

3. **Frontend can't reach backend?**
   - Update `FRONTEND_ORIGIN` with actual frontend URL
   - Update frontend environment.prod.ts with backend URL
