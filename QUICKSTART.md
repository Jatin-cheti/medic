# Medic Application - Quick Start Guide

## 🚀 Start the Application (5 minutes)

### Option 1: Using Docker (Recommended)

```powershell
# Open PowerShell and navigate to Medic folder
cd c:\Users\NEHA\OneDrive\Desktop\Medic

# Start all services
cd node
docker-compose up --build

# In a new PowerShell window, run migrations
cd c:\Users\NEHA\OneDrive\Desktop\Medic\node
docker exec medic_app npm run migrate:all
docker exec medic_app npm run seed:all

# Frontend is already running inside docker on port 4200
# Backend is running on port 3000
# Open browser: http://localhost:4200
```

### Option 2: Local Development

```powershell
# Terminal 1: Backend
cd c:\Users\NEHA\OneDrive\Desktop\Medic\node
npm install
npm run dev

# Terminal 2: Frontend
cd c:\Users\NEHA\OneDrive\Desktop\Medic\angular\medic
npm install
# Update proxy.conf.json target if needed
ng serve

# Open browser: http://localhost:4200
```

## 🧪 Test the Application

### Quick Test Flow

```powershell
# Open PowerShell
cd c:\Users\NEHA\OneDrive\Desktop\Medic\node

# Run automated tests
node src/test-e2e.js
```

**Expected Output:**
```
=== Medic Application E2E Tests ===

Testing Patient Signup...
✓ Patient signup returns 201
✓ Patient signup returns token
✓ Patient signup returns refreshToken
✓ Patient signup returns user

Testing Patient Login...
✓ Patient login returns 200
✓ Patient login returns token
✓ Patient login returns user

Testing Token Refresh...
✓ Token refresh returns 200
✓ Token refresh returns new token

Testing Dashboard Access...
✓ Dashboard returns 200
✓ Dashboard returns patient info
✓ Dashboard returns appointments array
✓ Dashboard returns stats

Testing Doctor Search...
✓ Doctor search returns 200
✓ Doctor search returns doctors array

Testing Authorization...
✓ Missing token returns 401
✓ Missing token error message

Testing Invalid Token...
✓ Invalid token returns 401
✓ Invalid token error message

=== Test Summary ===
Total Tests: 21
Passed: 21
Failed: 0
Pass Rate: 100%

✓ All tests passed!
```

## 🌐 Access the Application

### Frontend
- **URL**: http://localhost:4200
- **Start Page**: Patient Login
- **Signup**: Click "Not registered? Sign up"

### Backend API
- **Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000

### Databases
- **MySQL**: localhost:3307 (user: root, password: password)
- **MongoDB**: localhost:27018
- **Redis**: localhost:6379

## 📝 Test Account Details

### Create a Test Account

```powershell
# Using curl (Windows PowerShell)
$body = @{
    firstName = "Test"
    lastName = "Patient"
    email = "test@medic.app"
    phone = "9999999999"
    password = "TestPass123"
    gender = "Male"
    preferredLanguage = "en"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/patient/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Or Use the Web UI
1. Go to http://localhost:4200
2. Click "Not registered? Sign up"
3. Fill in the form:
   - First Name: Test
   - Last Name: Patient
   - Email: test@medic.app (or phone: 9999999999)
   - Gender: Male
   - Preferred Language: English
   - Password: TestPass123
   - Confirm Password: TestPass123
4. Click "Sign Up"
5. Login with your credentials
6. You'll see the Home Screen Dashboard

## 🎯 UI Walkthrough

### 1. Login Page
- Enter email or phone number
- Enter password
- Click "Login"
- Redirects to Home Screen

### 2. Home Screen (After Login)
A professional dashboard with:

**Header Section**
- Welcome message: "Welcome back, [First Name]! 👋"
- Quick stats: Appointments, Doctors, Chats

**Quick Actions**
- Find Doctors (🔍)
- My Appointments (📅)
- Symptom Checker (🩺)
- Chat History (💬)

**Upcoming Appointments Section**
- Shows next 5 appointments
- Doctor name and specialty
- Date and time
- Consultation fee
- Reschedule option

**Verified Doctors Section**
- Grid of recommended doctors
- Doctor name
- Rating (⭐/5)
- Years of experience
- Consultation fee
- "Book Now" button

**Recent Chats Section**
- List of recent conversations
- Other person's name
- Last message preview
- Timestamp

## 🔧 Troubleshooting

### Issue: "Connection refused" on port 3000
**Solution:**
```powershell
# Check if backend is running
netstat -ano | findstr :3000

# If not running, restart
cd c:\Users\NEHA\OneDrive\Desktop\Medic\node
docker-compose restart app
```

### Issue: "Cannot GET /api/patient/dashboard"
**Solution:**
- Ensure you're logged in (token in localStorage)
- Check browser DevTools → Network tab
- Verify Authorization header is present

### Issue: Blank dashboard after login
**Solution:**
```powershell
# Check backend logs
cd c:\Users\NEHA\OneDrive\Desktop\Medic\node
docker-compose logs app

# Check for database errors
docker-compose logs mysql
```

### Issue: CORS errors
**Solution:**
```powershell
# Update proxy.conf.json in angular/medic folder
# Ensure target matches your backend URL
```

## 📊 API Test Examples

### 1. Signup
```bash
POST http://localhost:3000/api/auth/patient/signup

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "password": "SecurePass123",
  "gender": "Male",
  "preferredLanguage": "en"
}

Response: { user: {...}, token: "...", refreshToken: "..." }
```

### 2. Login
```bash
POST http://localhost:3000/api/auth/patient/login

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: { user: {...}, token: "...", refreshToken: "..." }
```

### 3. Dashboard (Authenticated)
```bash
GET http://localhost:3000/api/patient/dashboard
Header: Authorization: Bearer <token>

Response: {
  patient: { id, first_name, last_name, email, ... },
  appointments: [ ... ],
  doctors: [ ... ],
  conversations: [ ... ],
  stats: { totalAppointments, totalDoctors, recentChats }
}
```

### 4. Search Doctors
```bash
GET http://localhost:3000/api/patient/doctors/search?limit=5&offset=0
Header: Authorization: Bearer <token>

Response: { doctors: [ ... ] }
```

## 🔑 Key Features to Explore

- ✅ **Authentication**: Signup, Login, JWT tokens
- ✅ **Home Screen**: Dashboard with appointments and doctors
- ✅ **Doctor Discovery**: Search and view verified doctors
- ✅ **Appointment Management**: View upcoming appointments
- ✅ **Messages**: See recent conversations
- ✅ **Responsive Design**: Try on mobile, tablet, desktop
- ✅ **Token Management**: Auto-refresh tokens
- ✅ **Error Handling**: Try unauthorized access
- ✅ **Role-Based Access**: Different routes for patients/doctors

## 📚 Important Files

| File | Purpose |
|------|---------|
| `node/src/routes/auth.ts` | Authentication endpoints |
| `node/src/routes/dashboard.ts` | Dashboard/patient endpoints |
| `node/src/middleware/auth.ts` | JWT verification middleware |
| `angular/medic/src/app/dashboard/home-screen/home-screen.component.ts` | Home screen logic |
| `angular/medic/src/app/core/services/auth.service.ts` | Auth HTTP service |
| `node/src/test-e2e.js` | Automated tests |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `IMPLEMENTATION_CHECKLIST.md` | Feature checklist |

## 🚀 Next Steps

1. **Explore the Dashboard**
   - View your upcoming appointments
   - Browse verified doctors
   - Check recent conversations

2. **Test Different Scenarios**
   - Create multiple accounts
   - View different user perspectives
   - Test authorization (try without token)

3. **Check the Code**
   - Backend: `node/src/routes/dashboard.ts`
   - Frontend: `angular/medic/src/app/dashboard/home-screen/`
   - Middleware: `node/src/middleware/auth.ts`

4. **Deploy to Vercel** (When Ready)
   - Follow steps in DEPLOYMENT_GUIDE.md
   - Set environment variables
   - Deploy backend and frontend separately

## 📞 Support Resources

- **Backend Logs**: `docker-compose logs app`
- **Database Logs**: `docker-compose logs mysql`
- **Browser Console**: F12 in browser for frontend errors
- **API Tests**: Use Postman, Insomnia, or `curl`
- **Documentation**: See DEPLOYMENT_GUIDE.md and IMPLEMENTATION_CHECKLIST.md

## ✅ Verification Checklist

After starting the app, verify:
- [ ] Frontend loads on http://localhost:4200
- [ ] Can signup with new email/phone
- [ ] Can login with credentials
- [ ] Dashboard shows user info and statistics
- [ ] API tests pass with `node src/test-e2e.js`
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Mobile view works (F12 → Toggle device toolbar)

---

**You're all set! The application is ready to use.** 🎉

For questions or issues, refer to the DEPLOYMENT_GUIDE.md file.
