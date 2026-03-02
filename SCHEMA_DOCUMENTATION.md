# Medic - Medical Consultation Platform

Complete backend database schema and architecture for a medical consultation platform with AI symptom checker, verified doctor video consultations, and real-time chat system.

## Overview

Medic is an India-focused healthcare platform supporting:
- **AI-based symptom checker** for initial health assessment
- **Verified doctor consultations** via video, audio, or chat
- **Real-time messaging** with media sharing
- **Multi-language support** (English, Hindi, Punjabi, Malayalam, Tamil, Telugu, Bengali, Marathi)
- **Digital prescriptions** and medical records
- **Payment processing** with refund management
- **Doctor verification** and document validation

---

## Database Architecture

### Technology Stack
- **MySQL 8.0**: Relational data, transactions, structured information
- **MongoDB 6.0**: Real-time messages, notifications, activity logs
- **Redis 7**: Caching, session management, presence tracking

---

## MySQL Schema (Relational Data)

### Core Tables

#### 1. **roles** - User role definitions
```
Columns: id, uuid, name (ENUM: patient/doctor/admin), description, created_at
Indexes: uuid, name
Purpose: Define user roles in the system
```

#### 2. **users** - Central user table (Patients, Doctors, Admins)
```
Columns:
- id, uuid, role_id (FK)
- email, phone (unique), password_hash
- first_name, last_name, avatar_url
- date_of_birth, gender
- is_verified, is_active, is_suspended
- preferred_language (i18n support)
- metadata (JSON for flexible attributes)
- last_login, created_at, updated_at

Indexes: uuid, email, phone, role_id, is_active
Purpose: Central user registry
```

#### 3. **languages** - Supported languages (i18n)
```
Columns: id, uuid, code (en, hi, pa, ml, ta, te, bn, mr), name, native_name, is_active
Indexes: uuid, code, is_active
Purpose: Language definitions for multi-language support
```

#### 4. **specialties** - Medical specialties
```
Columns: id, uuid, name, code, description, icon_url, is_active
Indexes: uuid, code, is_active
Examples: Cardiology, Dermatology, Orthopedics, Pediatrics, etc.
```

#### 5. **doctor_profiles** - Doctor-specific information
```
Columns:
- id, uuid, user_id (FK, unique)
- registration_number (unique, medical registration)
- bio, years_of_experience
- clinic_address, consultation_fee
- is_verified, verification_date, verified_by (admin user)
- is_approved, approval_date
- is_suspended
- rating (decimal 3.2), total_consultations
- created_at, updated_at

Indexes: uuid, user_id, registration_number, is_verified, is_approved, rating
Purpose: Extended profile for doctors
```

#### 6. **doctor_specialties** - Doctor-Specialty relationship (many-to-many)
```
Columns: id, doctor_id (FK), specialty_id (FK)
Constraint: Unique (doctor_id, specialty_id)
Indexes: doctor_id, specialty_id
Purpose: Doctors can have multiple specialties
```

#### 7. **doctor_languages** - Doctor-Language proficiency (many-to-many)
```
Columns:
- id, doctor_id (FK), language_id (FK)
- proficiency_level (ENUM: basic, intermediate, fluent)
Constraint: Unique (doctor_id, language_id)
Indexes: doctor_id, language_id
Purpose: Track languages spoken by doctors
```

#### 8. **document_types** - Types of required documents
```
Columns: id, uuid, name, code, description, is_required, is_active
Examples: Medical Degree, Medical License, Government ID, Specialization Certificate
Purpose: Define document types for doctor verification
```

#### 9. **doctor_documents** - Doctor uploaded documents
```
Columns:
- id, uuid, doctor_id (FK), document_type_id (FK)
- file_url, file_name
- status (ENUM: pending, approved, rejected)
- rejection_reason
- verified_by (FK to admin user), verified_at
- expiry_date
- created_at, updated_at

Indexes: uuid, doctor_id, status
Purpose: Store and track doctor documents
```

#### 10. **availability_slots** - Doctor availability for appointments
```
Columns:
- id, uuid, doctor_id (FK)
- day_of_week (0-6), start_time, end_time
- slot_duration_minutes (default 30)
- is_active
- created_at, updated_at

Indexes: uuid, doctor_id
Purpose: Define recurring availability slots
```

#### 11. **appointments** - Appointment bookings
```
Columns:
- id, uuid, patient_id (FK), doctor_id (FK)
- scheduled_at, duration_minutes
- status (ENUM: pending, confirmed, in_progress, completed, cancelled, no_show)
- consultation_type (ENUM: video, chat, audio)
- reason, symptoms, medical_history
- appointment_fee, notes
- confirmed_at, started_at, ended_at
- cancellation_reason, meeting_link
- created_at, updated_at

Indexes: uuid, patient_id, doctor_id, status, scheduled_at
Purpose: Track all appointments
```

#### 12. **payment_methods** - Available payment options
```
Columns: id, uuid, name, code, is_active
Examples: UPI, Credit Card, Debit Card, Net Banking, Wallet
Purpose: Define payment methods
```

#### 13. **payments** - Payment transactions
```
Columns:
- id, uuid, appointment_id (FK), payment_method_id (FK)
- amount, status (ENUM: pending, completed, failed, refunded)
- transaction_id, payment_reference
- refund_amount, refund_reason, refund_date
- paid_at, created_at, updated_at

Indexes: uuid, appointment_id, status, transaction_id
Purpose: Track payment transactions
```

#### 14. **prescriptions** - Digital prescriptions
```
Columns:
- id, uuid, appointment_id (FK), doctor_id (FK), patient_id (FK)
- diagnosis, notes, file_url
- is_digital, issued_at, valid_until
- created_at, updated_at

Indexes: uuid, appointment_id, doctor_id, patient_id
Purpose: Store digital prescriptions
```

#### 15. **prescription_items** - Individual medicines in prescription
```
Columns:
- id, uuid, prescription_id (FK)
- medicine_name, dosage, frequency, duration
- instructions
- created_at, updated_at

Indexes: uuid, prescription_id
Purpose: Line items for prescriptions
```

#### 16. **reviews** - Doctor reviews and ratings
```
Columns:
- id, uuid, appointment_id (FK), doctor_id (FK), patient_id (FK)
- rating (3.2 decimal), review_text
- would_recommend (boolean)
- is_anonymous, is_approved, is_flagged
- created_at, updated_at

Indexes: uuid, doctor_id, patient_id, is_approved
Purpose: Patient reviews and ratings for doctors
```

#### 17. **conversations** - Chat conversations
```
Columns:
- id, uuid, appointment_id (FK, nullable)
- patient_id (FK), doctor_id (FK)
- type (ENUM: appointment_chat, direct_message)
- last_message_at, is_archived
- created_at, updated_at

Indexes: uuid, patient_id, doctor_id, appointment_id
Purpose: Chat conversation metadata (messages in MongoDB)
```

#### 18. **admin_logs** - Admin activity audit trail
```
Columns:
- id, uuid, admin_id (FK), action
- target_user_id (FK, nullable), target_doctor_id (FK, nullable)
- description, changes (JSON), ip_address, user_agent
- created_at

Indexes: uuid, admin_id, action, created_at
Purpose: Audit trail for admin actions
```

---

## MongoDB Collections (Real-time & NoSQL Data)

### Collections

#### 1. **messages** - Chat messages
```json
{
  "_id": ObjectId,
  "conversation_id": Long,
  "sender_id": Long,
  "content": String,
  "message_type": String (text/image/file/video/audio),
  "is_edited": Boolean,
  "edited_at": Date,
  "is_deleted": Boolean,
  "deleted_at": Date,
  "created_at": Date,
  "updated_at": Date
}

Indexes: {conversation_id, created_at}, {sender_id}, {created_at}, {is_deleted}
Purpose: Real-time chat messages with soft delete support
```

#### 2. **message_attachments** - File attachments in messages
```json
{
  "_id": ObjectId,
  "message_id": ObjectId,
  "file_url": String,
  "file_name": String,
  "file_type": String (MIME type),
  "file_size": Long,
  "metadata": Object,
  "created_at": Date
}

Indexes: {message_id}, {created_at}
Purpose: Store references to uploaded files/media
```

#### 3. **message_receipts** - Message delivery & read status
```json
{
  "_id": ObjectId,
  "message_id": ObjectId,
  "recipient_id": Long,
  "status": String (sent/delivered/read/failed),
  "delivered_at": Date,
  "read_at": Date,
  "created_at": Date
}

Indexes: {message_id, recipient_id}, {recipient_id, created_at}, {status}
Purpose: Track message delivery and read status per recipient
```

#### 4. **notifications** - User notifications
```json
{
  "_id": ObjectId,
  "user_id": Long,
  "type": String (appointment_confirmed/new_message/etc),
  "title": String,
  "body": String,
  "related_id": Long,
  "is_read": Boolean,
  "read_at": Date,
  "metadata": Object,
  "created_at": Date
}

Indexes: {user_id, created_at}, {user_id, is_read}, {type}
Purpose: Push notifications and in-app notifications
```

#### 5. **ai_symptom_history** - AI symptom checker usage
```json
{
  "_id": ObjectId,
  "user_id": Long,
  "symptoms": [String],
  "ai_response": String,
  "severity_level": String (mild/moderate/severe),
  "language": String,
  "doctor_consultation_done": Boolean,
  "doctor_id": Long,
  "appointment_id": Long,
  "created_at": Date,
  "updated_at": Date
}

Indexes: {user_id, created_at}, {created_at}
Purpose: Track AI symptom checker usage and follow-ups
```

#### 6. **call_sessions** - Video/Audio consultation sessions
```json
{
  "_id": ObjectId,
  "appointment_id": Long,
  "initiated_by": Long,
  "session_id": String,
  "call_type": String (video/audio/chat),
  "status": String (initiated/ringing/connected/ended/missed),
  "started_at": Date,
  "ended_at": Date,
  "duration_seconds": Int,
  "recording_url": String,
  "is_recorded": Boolean,
  "quality_metrics": Object,
  "created_at": Date
}

Indexes: {appointment_id}, {initiated_by}, {session_id}, {created_at}
Purpose: Track video/audio consultation sessions and recordings
```

---

## ER Diagram (Text Format)

```
┌─────────────────┐
│     roles       │
├─────────────────┤
│ id (PK)         │
│ uuid (unique)   │
│ name (ENUM)     │
└────────┬────────┘
         │1
         │
         │N
    ┌────▼─────────────┐
    │      users       │
    ├──────────────────┤
    │ id (PK)          │
    │ uuid             │
    │ role_id (FK)     │
    │ email            │
    │ phone            │
    │ first_name       │
    │ last_name        │
    │ is_verified      │
    │ is_active        │
    │ preferred_language
    └────┬──────────┬──┬────────┐
         │          │  │        │
         │1         │  │1       │
         │          │  │        │
    ┌────▼──────────┐  │   ┌────▼────────────┐
    │ doctor_profiles   │      │ conversations  │
    ├────────────────┤  │   ├────────────────┤
    │ id (PK)        │  │   │ id (PK)        │
    │ user_id (FK)   │  │   │ patient_id(FK) │
    │ registration   │  │   │ doctor_id (FK) │
    │ rating         │  │   │ type           │
    │ consultation   │  │   └────────────────┘
    └────┬───────┬──┘  │
         │       │     │
         │       │     │1
    ┌─────▼─────▼────┐ │
    │ doctor_specialties
    │ doctor_languages
    │ appointments
    └──────────────┘

appointments ──N──┬──┬──1──► doctor_profiles
                  │  │
                  │  └──N──► payments  ──1──► payment_methods
                  │
                  └──N──► prescriptions ──N──► prescription_items
                  │
                  └──1──► doctor_profiles
                  │
                  └──N──► reviews
                  │
                  └──1──► conversations (in MySQL)
                           ├─ Messages (in MongoDB)
                           ├─ Message Attachments (in MongoDB)
                           └─ Message Receipts (in MongoDB)
```

---

## API Structure

### Authentication Endpoints
```
POST   /api/auth/register        - Patient/Doctor signup
POST   /api/auth/login           - Login
POST   /api/auth/logout          - Logout
POST   /api/auth/refresh-token   - Refresh JWT
POST   /api/auth/forgot-password - Reset password
```

### Patient Endpoints
```
GET    /api/patients/profile     - Get patient profile
PUT    /api/patients/profile     - Update profile
GET    /api/patients/language    - Get preferred language
PUT    /api/patients/language    - Set preferred language
POST   /api/ai-symptom-checker   - Run AI symptom check
GET    /api/doctors              - List doctors (with filters)
GET    /api/doctors/:id          - Get doctor details
GET    /api/appointments         - List patient appointments
POST   /api/appointments         - Book appointment
GET    /api/conversations        - List chats
POST   /api/conversations/:id/messages - Send message
GET    /api/prescriptions        - Get patient prescriptions
POST   /api/reviews              - Submit doctor review
```

### Doctor Endpoints
```
GET    /api/doctors/profile      - Get doctor profile
PUT    /api/doctors/profile      - Update profile
POST   /api/doctors/documents    - Upload verification documents
GET    /api/doctors/appointments - List doctor appointments
PUT    /api/appointments/:id     - Confirm/reject appointment
POST   /api/prescriptions        - Upload prescription
POST   /api/availability-slots   - Set availability
GET    /api/conversations        - List patient chats
POST   /api/calls/initiate       - Start video call
```

### Admin Endpoints
```
GET    /api/admin/doctors        - List pending doctors
POST   /api/admin/doctors/:id/verify    - Verify doctor
POST   /api/admin/doctors/:id/approve   - Approve doctor
POST   /api/admin/doctors/:id/suspend   - Suspend doctor
GET    /api/admin/payments       - Payment reports
GET    /api/admin/analytics      - Platform analytics
POST   /api/admin/logs           - View audit logs
```

---

## Migration & Seeder Files

### MySQL Migrations
- `10000001-create-roles.js`
- `10000002-create-users.js`
- `10000003-create-languages.js`
- `10000004-create-specialties.js`
- `10000005-create-doctor-profiles.js`
- `10000006-create-doctor-specialties.js`
- `10000007-create-doctor-languages.js`
- `10000008-create-document-types.js`
- `10000009-create-doctor-documents.js`
- `10000010-create-appointments.js`
- `10000011-create-availability-slots.js`
- `10000012-create-payment-methods.js`
- `10000013-create-payments.js`
- `10000014-create-prescriptions.js`
- `10000015-create-prescription-items.js`
- `10000016-create-reviews.js`
- `10000017-create-conversations.js`
- `10000018-create-admin-logs.js`

### MySQL Seeders
- `100000001-seed-roles.js`
- `100000002-seed-languages.js`
- `100000003-seed-specialties.js`
- `100000004-seed-document-types.js`
- `100000005-seed-payment-methods.js`
- `100000006-seed-users.js` (admin, doctors, patients)
- `100000007-seed-doctor-profiles.js`

### MongoDB Migrations
- `20260228_create_messages_collection.js`
- `20260229_create_message_attachments_collection.js`
- `20260230_create_message_receipts_collection.js`
- `20260301_create_notifications_collection.js`
- `20260302_create_ai_symptom_history_collection.js`
- `20260303_create_call_sessions_collection.js`

### MongoDB Seeders
- `20260304_seed_messages.js`
- `20260305_seed_notifications.js`

---

## Multi-Language (i18n) Implementation

### Supported Languages
- **en** - English
- **hi** - हिंदी (Hindi)
- **pa** - ਪੰਜਾਬੀ (Punjabi)
- **ml** - മലയാളം (Malayalam)
- **ta** - தமிழ் (Tamil)
- **te** - తెలుగు (Telugu)
- **bn** - বাংলা (Bengali)
- **mr** - मराठी (Marathi)

### Implementation Strategy
1. **Frontend**: Use react-i18next
2. **Backend**:
   - Store user's `preferred_language` in `users.preferred_language`
   - Return language-specific strings in API responses
   - Support language parameter in requests: `?lang=hi`
   - Doctor profiles can have multi-language descriptions
3. **Database**:
   - All UI text managed by frontend translation files
   - Medical content (doctor bios, etc.) stored as-is, frontend applies i18n
   - AI symptom responses generated in user's preferred language

---

## Security & Compliance

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Doctor verification before consultation
- Admin approval for doctor registration

### Data Privacy
- Encrypted storage for sensitive documents
- Secure file upload to S3 with signed URLs
- Message encryption for patient confidentiality
- GDPR-compliant data retention policies

### Medical Compliance
- AI symptom checker includes disclaimer
- Doctor credentials verification mandatory
- Prescription audit trail
- Appointment and consultation recording consent

---

## Deployment Architecture

### Docker Services
- **MySQL**: Port 3306
- **MongoDB**: Port 27017
- **Redis**: Port 6379
- **Node.js App**: Port 3000
- **Frontend**: Port 3001

### Environment Variables
```
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3001

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h

# Databases
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=medicdb
MONGO_URL=mongodb://mongo:27017/medicdb
REDIS_URL=redis://redis:6379

# Sequelize
SEQUELIZE_LOG=false
```

---

## Running Migrations & Seeders

### MySQL
```bash
# Run all migrations
npm run migrate:sql

# Undo migrations
npm run migrate:sql:undo:all

# Seed data
npm run seed:all
```

### MongoDB
```bash
# Run migrations
npm run migrate:mongo

# Rollback migrations
npm run migrate:mongo:down
```

### All
```bash
# Run all migrations and seeds
npm run migrate:all
```

---

## Development Quick Start

```bash
# Install dependencies
cd node
npm install

# Start with Docker
docker compose up --build

# Application will be available at:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:3001
```

---

## Future Enhancements

- Wallet system for patient payments
- Appointment wallet top-up
- Doctor earnings dashboard
- Advanced analytics and reporting
- Appointment reminder SMS/Email
- Integration with pharmacy systems
- Telemedicine device support
- Insurance claim assistance
- Specialist referral system

---

## Support

For schema questions or updates, please refer to the migration files and this documentation.
