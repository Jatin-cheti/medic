# Run Migrations on Railway - Quick Guide

Railway has auto-redeployed with your latest changes. Now let's set up the database!

---

## ✅ What Just Happened

I fixed the MongoDB error:
- ✅ Made MongoDB **optional** (app won't crash if missing)
- ✅ Pushed to GitHub (commit `35094a7`)
- ✅ Railway is **auto-deploying** now

Check your Railway logs - you should see:
```
✅ MySQL connected
⚠️  MongoDB URL not set - skipping MongoDB initialization
✅ Server listening on http://0.0.0.0:3000
```

---

## 🚀 Run Migrations on Railway (3 Commands)

### Method 1: Using Railway CLI (Recommended)

```bash
# From your project root (c:\Users\NEHA\OneDrive\Desktop\Medic)

# 1. Run migrations (creates all 20 tables)
railway run sh -c "cd node && node run-migrations.js"

# 2. Seed reference data (roles, languages, specialties, etc.)
railway run sh -c "cd node && node seed-data.js"

# 3. Verify tables were created
railway run sh -c "cd node && node -e \"require('mysql2/promise').connect(process.env.DATABASE_URL).then(async c => { const [tables] = await c.execute('SHOW TABLES'); console.log('Tables:', tables.length); tables.forEach(t => console.log('  -', Object.values(t)[0])); c.end(); })\""
```

---

### Method 2: Railway Dashboard Shell (No CLI)

1. Go to [railway.app](https://railway.app) → Your Project → **Backend service**
2. Click **"..."** (three dots menu) → **"Shell"**
3. Wait for shell to connect
4. Run these commands:

```bash
# Navigate to node directory
cd node

# Run migrations
node run-migrations.js

# Seed data
node seed-data.js

# Verify
echo "Done! Tables created."
```

---

## 📊 What the Migrations Will Create

**20 MySQL Tables:**
1. roles
2. users
3. languages
4. specialties
5. doctor_profiles
6. doctor_specialties
7. doctor_languages
8. document_types
9. doctor_documents
10. appointments
11. availability_slots
12. payment_methods
13. payments
14. prescriptions
15. prescription_items
16. reviews
17. conversations
18. conversation_participants
19. admin_logs
20. (one more based on your schema)

**Reference Data:**
- 3 roles (patient, doctor, admin)
- 5 languages (English, Hindi, Spanish, French, German)
- 7 medical specialties
- 4 document types
- 5 payment methods

---

## ✅ Expected Output

### Migrations Output:
```
Connecting to database...
✓ Connected successfully
Running migrations from src/migrations/sql/*.js

Migration: 10000001-create-roles.js
  ✓ Table 'roles' created

Migration: 10000002-create-users.js
  ✓ Table 'users' created

... (18 more tables)

✅ All migrations completed successfully!
```

### Seed Data Output:
```
Seeding roles...
  ✓ Created role: patient
  ✓ Created role: doctor
  ✓ Created role: admin

Seeding languages...
  ✓ Created language: English
  ✓ Created language: Hindi
  ... (3 more)

Seeding specialties...
  ✓ Created specialty: Cardiology
  ... (6 more)

✅ All seed data inserted successfully!
```

---

## 🔍 Verify in Railway MySQL Service

1. Go to Railway → Your **MySQL service**
2. Click **"Data"** tab
3. You should see all 20 tables with data!

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'mysql2'"
**Solution**: Migrations use mysql2 directly. Make sure it's in package.json (it already is).

### Error: "DATABASE_URL is not set"
**Solution**: Check Railway Variables - make sure DATABASE_URL is set or referenced from MySQL service.

### Error: "Table already exists"
**Solution**: Migrations are safe to re-run. They'll skip existing tables.

### MongoDB Errors?
**Solution**: Ignore them! MongoDB is now optional. Your app works without it.

---

## 🎯 After Migrations Complete

1. **Test Your Backend**:
   ```bash
   # Get your Railway backend URL
   railway domain
   
   # Test health check
   curl https://your-backend-url.railway.app/
   
   # Should return: {"status":"ok","time":"..."}
   ```

2. **Test Patient Signup**:
   ```bash
   curl -X POST https://your-backend-url.railway.app/api/auth/patient/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe","phone":"1234567890","gender":"Male","preferredLanguage":"en"}'
   ```

3. **Get Backend URL for Frontend**:
   - Copy the URL from `railway domain` command
   - You'll need this to configure your frontend

---

## 📝 Next Steps

After migrations succeed:
1. ✅ Get your backend URL
2. ✅ Update frontend environment.prod.ts with backend URL
3. ✅ Deploy frontend to Vercel or Railway
4. ✅ Test end-to-end (signup → login → dashboard)

---

## 🆘 Need Help?

Run into issues? Check:
- Railway backend logs: Backend service → Deployments → Latest → Logs
- MySQL service logs: MySQL service → Logs
- Your local `.env` file has the right JWT secrets (already set!)

**Ready to run migrations? Use Method 1 (Railway CLI) - it's fastest!**
