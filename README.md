# Medic - Healthcare Booking Platform

A modern healthcare booking platform connecting patients with doctors for appointments, consultations, and health management.

## Features

### Patient Features
- User registration and authentication
- Search and browse doctors by specialty
- Book appointments
- Video consultations
- Real-time chat with doctors
- View medical history
- Prescription management

### Doctor Features
- Professional profile management
- Appointment scheduling
- Patient consultation history
- Video consultations
- Prescription creation
- Chat with patients

### Admin Features
- User management
- Doctor verification
- Platform analytics
- Content management

## Tech Stack

### Frontend
- **Framework**: Angular 21 with SSR
- **UI**: Custom components with responsive design
- **State Management**: RxJS
- **Authentication**: JWT with refresh tokens
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL (via Sequelize ORM) + MongoDB
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: WebSocket for chat and notifications
- **Deployment**: Railway

## Project Structure

```
medic/
├── angular/medic/      # Frontend Angular application
│   └── src/
│       ├── app/
│       │   ├── auth/           # Authentication modules
│       │   ├── dashboard/      # Dashboard components
│       │   ├── core/           # Guards, interceptors, services
│       │   └── shared/         # Reusable components
│       └── environments/
├── node/                # Backend Node.js application
│   └── src/
│       ├── routes/             # API routes
│       ├── model/              # Database models
│       ├── middleware/         # Auth & error handling
│       ├── migrations/         # Database migrations
│       ├── seeders/            # Database seed data
│       └── services/           # Database services
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- MongoDB 6.0+
- Docker (optional)

### Environment Setup

Create `.env` file in the `node/` directory:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=mysql://user:password@host:port/database
MONGO_URL=mongodb://host:port/database

# JWT Secrets (generate strong random strings)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Frontend URL
FRONTEND_ORIGIN=http://localhost:4200

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Installation

1. **Install Backend Dependencies**
```bash
cd node
npm install
```

2. **Install Frontend Dependencies**
```bash
cd angular/medic
npm install
```

### Running the Application

#### Using Docker
```bash
cd node
docker compose up --build
```

#### Manual Setup

1. **Start Backend**
```bash
cd node
npm run dev
```

2. **Start Frontend**
```bash
cd angular/medic
npm start
```

The application will be available at:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

## Database Setup

Run migrations and seeders:
```bash
cd node
npm run migrate
npm run seed
```

## API Endpoints

- `POST /api/auth/patient/signup` - Patient registration
- `POST /api/auth/patient/login` - Patient login
- `POST /api/auth/doctor/login` - Doctor login
- `GET /api/patient/dashboard` - Patient dashboard data
- `GET /api/doctor/dashboard` - Doctor dashboard data

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- HTTP-only cookies for refresh tokens
- CORS configured for production domains
- Environment variables for sensitive data

## License

Private - All Rights Reserved

## Author

Jatin Cheti
