# 🚀 Quick Fix: Run Migrations on Railway

## Problem
Tables don't exist in Railway MySQL database yet.

## Solution: Use Railway Dashboard Shell (2 minutes)

### Steps:

1. **Open Railway Dashboard**
   - Go to [railway.app](https://railway.app)
   - Project: **capable-nature**  
   - Click on **medic** service (your Node.js backend)

2. **Open Shell**
   - Click the **"..."** menu (three dots) in top right
   - Click **"Shell"** or **"Terminal"**
   - Wait for terminal to connect (~10 seconds)

3. **Run Migrations**
   ```bash
   node run-migrations.js
   ```
   
   **You should see:**
   ```
   ✓ Migration completed (roles)
   ✓ Migration completed (users)
   ✓ Migration completed (languages)
   ... (20 total tables)
   All migrations completed successfully!
   ```

4. **Run Seed Data**
   ```bash
   node seed-data.js
   ```
   
   **You should see:**
   ```
   ✓ Created role: patient
   ✓ Created role: doctor
   ... (roles, languages, specialties, etc.)
   ✅ All seed data inserted successfully!
   ```

5. **Done!** Close the shell and test your backend.

---

## Test After Migrations

```powershell
# Back in your local PowerShell
$body = @{
    email = "test@example.com"
    password = "Test123!"
    firstName = "John"
    lastName = "Doe"
    phone = "1234567890"
    gender = "Male"
    preferredLanguage = "en"
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "https://medic-production-0311.up.railway.app/api/auth/patient/signup" `
     -ContentType "application/json" -Body $body
```

**Expected:**
```json
{
  "user": { "uuid": "...", "email": "test@example.com" },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

✅ **If you see a token, migrations worked!**

---

## Alternative: Wait for Auto-Deploy (Slower)

The code changes I pushed should auto-deploy in 3-5 minutes. If you want to wait:

```powershell
# Check logs until you see migration output
railway logs --tail 50
```

Look for:
```
Running migration: 10000001-create-roles.js
  Creating table: roles
```

---

## Next Steps After Migrations Success

1. ✅ Test all endpoints (signup, login, dashboard)
2. 🔜 Deploy frontend to Vercel/Railway  
3. 🔜 Update frontend with backend URL
4. 🔜 Test end-to-end

Need help? Let me know! 🚀
