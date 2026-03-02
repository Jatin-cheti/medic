# Medic Application - Home Screen & Deployment Guide

## Overview

This document outlines the complete flow for:
1. Patient signup and login with JWT authentication
2. Home screen dashboard with appointment management
3. Doctor search and management
4. Role-based access control
5. Deployment to Vercel

## Architecture

### Backend Stack
- **Framework**: Express.js + TypeScript
- **Databases**: MySQL 8.0 + MongoDB 6
- **Cache**: Redis 7
- **Authentication**: JWT (access token: 24h, refresh token: 7d)
- **Middleware**: Token verification and role-based access control

### Frontend Stack
- **Framework**: Angular 21 (Standalone Components)
- **Styling**: SCSS with responsive design
- **Authentication**: JWT stored in localStorage
- **API Client**: HttpClient with interceptors

### Features Implemented

#### Authentication
✅ Patient signup with email/phone
✅ Doctor signup with credentials and documents
✅ Patient login with email or phone
✅ JWT tokens with refresh mechanism
✅ Google OAuth 2.0 callback support
✅ Role-based access control (patient/doctor/admin)

#### Dashboard (Home Screen)
✅ Welcome card with user greeting
✅ Statistics display (appointments, doctors, chats)
✅ Quick action buttons
✅ Upcoming appointments list
✅ Verified doctors grid
✅ Recent chats/conversations
✅ Empty state handling
✅ Mobile responsive design

#### API Endpoints
✅ `POST /api/auth/patient/signup` - Patient registration
✅ `POST /api/auth/patient/login` - Patient login
✅ `POST /api/auth/doctor/signup` - Doctor registration
✅ `POST /api/auth/doctor/login` - Doctor login
✅ `POST /api/auth/refresh-token` - Token refresh
✅ `POST /api/auth/google-callback` - Google OAuth callback
✅ `GET /api/patient/dashboard` - Dashboard data (protected)
✅ `GET /api/patient/doctors/search` - Search doctors (protected)
✅ `GET /api/patient/doctors/:id` - Get doctor profile (protected)
✅ `GET /api/patient/appointments/history` - Appointments history (protected)

## Database Schema

### Users Table
```sql
- id (bigint, PK)
- uuid (string, unique)
- role_id (FK to roles)
- email (string, unique, nullable)
- phone (string, unique, nullable)
- password_hash (string, nullable)
- first_name (string)
- last_name (string)
- gender (string, nullable)
- preferred_language (string)
- google_id (string, unique, nullable)
- is_verified (boolean, default: 0)
- is_active (boolean, default: 1)
- is_suspended (boolean, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

### Doctor Profiles Table
```sql
- id (bigint, PK)
- user_id (FK to users)
- registration_number (string)
- years_of_experience (int)
- consultation_fee (decimal)
- is_verified (boolean, default: 0)
- is_approved (boolean, default: 0)
- is_suspended (boolean, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

### Appointments Table
```sql
- id (bigint, PK)
- uuid (string, unique)
- patient_id (FK to users)
- doctor_id (FK to doctor_profiles)
- scheduled_at (datetime)
- duration_minutes (int)
- status (enum: pending, confirmed, in_progress, completed, cancelled)
- consultation_type (enum: video, chat, audio)
- appointment_fee (decimal)
- created_at (timestamp)
- updated_at (timestamp)
```

## Environment Variables

### Backend (.env)
```
# App Configuration
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:4200

# JWT Configuration
JWT_SECRET=replace_this_with_a_strong_secret_min_32_chars_please
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=replace_this_with_a_strong_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=medicdb
DATABASE_URL=mysql://root:password@mysql:3306/medicdb

# MongoDB Configuration
MONGO_URL=mongodb://mongo:27017/medicdb

# Redis Configuration
REDIS_URL=redis://redis:6379

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google-callback
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Running Locally with Docker

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ and npm
- Angular CLI installed

### Setup

1. **Clone and navigate to project**
```bash
cd Medic
```

2. **Install dependencies**
```bash
# Backend
cd node
npm install

# Frontend
cd ../angular/medic
npm install
cd ../..
```

3. **Build and start Docker containers**
```bash
cd node
docker-compose up --build
```

This starts:
- MySQL on port 3307
- MongoDB on port 27018
- Redis on port 6379
- Backend on port 3000
- Frontend on port 4200

4. **Run migrations and seeds**
```bash
# In a new terminal
cd node
npm run migrate:all
npm run seed:all
```

5. **Start development servers**
```bash
# Backend
cd node
npm run dev

# Frontend (in another terminal)
cd angular/medic
ng serve
```

6. **Access the application**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Health check: http://localhost:3000/

## Testing End-to-End Flow

### 1. Patient Signup
```bash
curl -X POST http://localhost:3000/api/auth/patient/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9999999999",
    "password": "SecurePass123!",
    "gender": "Male",
    "preferredLanguage": "en"
  }'
```

### 2. Patient Login
```bash
curl -X POST http://localhost:3000/api/auth/patient/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "user": { "id": 1, "email": "john@example.com", ... },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "role": "patient"
}
```

### 3. Access Dashboard
```bash
curl -X GET http://localhost:3000/api/patient/dashboard \
  -H "Authorization: Bearer <token>"
```

### 4. Run Automated Tests
```bash
cd node
node src/test-e2e.js
```

## Frontend Components

### Home Screen Component Structure
```
home-screen/
├── home-screen.component.ts       # Component logic, API calls
├── home-screen.component.html     # Template with sections
├── home-screen.component.scss     # Styling (responsive)
└── home-screen.component.spec.ts # Unit tests (to be added)
```

### Component Sections
1. **Header** - Welcome card with stats
2. **Quick Actions** - Find doctors, appointments, etc.
3. **Upcoming Appointments** - List of scheduled appointments
4. **Verified Doctors** - Grid of recommended doctors
5. **Recent Chats** - Conversation list
6. **Empty States** - Placeholder content when no data
7. **Loading State** - Spinner during data fetch

### Styling
- Primary Color: #154E99 (Blue)
- Secondary Color: #7FB5FA (Light Blue)
- Background: #F0F0F2 (Light Gray)
- Responsive breakpoints: 1400px, 1024px, 768px, 480px
- Mobile-first design

## Security Implementation

### JWT Middleware
```typescript
// All protected routes use this middleware
router.get('/api/patient/dashboard', 
  verifyToken,                    // Checks token validity
  verifyRole(['patient']),        // Checks user role
  async (req, res) => { ... }
);
```

### Token Storage
- Access token: localStorage (expires in 24 hours)
- Refresh token: localStorage (expires in 7 days)
- Authorization header: `Bearer <access_token>`

### Password Security
- Hashed with bcrypt (10 rounds)
- Minimum 6 characters
- Verified on login

### CORS Configuration
- Only accepts requests from allowed origins
- Credentials enabled for cookie-based auth

## Deployment to Vercel

### 1. Prepare Backend for Serverless

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "src/index.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "env": {
    "JWT_SECRET": "@jwt_secret",
    "JWT_REFRESH_SECRET": "@jwt_refresh_secret",
    "DB_HOST": "@db_host",
    "DB_USER": "@db_user",
    "DB_PASSWORD": "@db_password",
    "MONGO_URL": "@mongo_url",
    "REDIS_URL": "@redis_url"
  }
}
```

### 2. Prepare Frontend for Vercel

```bash
# Build Angular app
cd angular/medic
ng build

# Output: dist/medic/browser/
```

### 3. Set Environment Variables on Vercel

Dashboard → Project Settings → Environment Variables

**Backend:**
- JWT_SECRET
- JWT_REFRESH_SECRET
- DB_HOST (Production MySQL URL)
- DB_USER
- DB_PASSWORD
- MONGO_URL (Production MongoDB URL)
- REDIS_URL (Production Redis URL)
- FRONTEND_ORIGIN=https://your-domain.vercel.app
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### 4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd node
vercel

# Deploy frontend
cd angular/medic
vercel
```

## Troubleshooting

### Issue: Token verification fails
**Solution**: Ensure JWT_SECRET is same in .env across all environments

### Issue: CORS errors
**Solution**: Update FRONTEND_ORIGIN in .env to match frontend domain

### Issue: Database connection timeout
**Solution**: Check MySQL/MongoDB service health with `docker-compose logs`

### Issue: 401 Unauthorized on protected routes
**Solution**: Verify token is included in Authorization header: `Bearer <token>`

### Issue: Role-based access denied
**Solution**: Ensure user role is correctly assigned during signup (patient/doctor/admin)

## Next Steps

1. ✅ Implement additional routes for book appointment, cancel appointment
2. ✅ Add real-time notifications via WebSocket
3. ✅ Implement video call functionality
4. ✅ Add prescription management
5. ✅ Implement payment processing
6. ✅ Add analytics dashboard for doctors

## Support

For issues or questions, refer to:
- Backend logs: `docker-compose logs app`
- Frontend console: Browser DevTools → Console
- Test suite: `node node/src/test-e2e.js`

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: Production Ready
