# Development Plan

Requirement: Build a full-stack medical consultation platform (Medic). Multi-role auth: Patients, Doctors, Admins, Super Admins. Doctor onboarding: doctors upload experience certificate and degree on signup, cannot login until Admin approves documents; admins can approve/reject/request-changes; doctors are notified of status changes. Patient features: AI symptom checker agent, browse doctors list and book video/audio/physical appointments, view past appointments and bills, save prescriptions (image or text uploads). Doctor dashboard: symptom checker tool, view upcoming and past appointments, send appointment reminders to patients, set consultation rates, upload additional documents. Admin features: view all users filtered by Doctor/Patient role, document verification tab for approving doctor uploads. Super Admin: all admin powers plus ability to add new admins. Tech stack: Angular 17 frontend reusing existing color palette primary #154E99, Bootstrap 5, Inter/Poppins fonts. Node.js/Express backend using existing MySQL plus MongoDB hybrid. JWT auth with role-based access control.

Generated: 2026-03-07T23:12:14.063Z

---

# Engineering Plan

## 1. Feature List
- Multi-role authentication (Patients, Doctors, Admins, Super Admins)
- Doctor onboarding with document upload and admin approval
- Notification system for doctors regarding document status
- AI symptom checker for patients
- Browse doctors and book appointments (video/audio/physical)
- View past appointments and bills
- Save prescriptions (image/text uploads)
- Doctor dashboard with symptom checker tool
- View upcoming and past appointments for doctors
- Send appointment reminders to patients
- Set consultation rates for doctors
- Admin panel to view users by role
- Document verification tab for admin approval of doctor uploads
- Super Admin features to manage admins

## 2. Architecture Overview
- **Frontend**: Angular 17 with Bootstrap 5 for UI components and styling.
- **Backend**: Node.js with Express for RESTful API development.
- **Database**: MySQL for structured data (user accounts, appointments) and MongoDB for unstructured data (documents, prescriptions).
- **Communication**: Frontend communicates with the backend via RESTful API calls. The backend interacts with both MySQL and MongoDB for data retrieval and storage.

## 3. Frontend Pages
- **Home Page**
  - Route: `/`
  - Components: Header, Footer, AI Symptom Checker, Featured Doctors
  - Purpose: Introduce the platform and provide access to the symptom checker and doctor listings.

- **Login Page**
  - Route: `/login`
  - Components: Login Form
  - Purpose: Allow users to log in based on their roles.

- **Signup Page**
  - Route: `/signup`
  - Components: Signup Form (with document upload for doctors)
  - Purpose: Allow new users to create accounts.

- **Doctor Dashboard**
  - Route: `/doctor/dashboard`
  - Components: Upcoming Appointments, Past Appointments, Consultation Rates, Document Upload
  - Purpose: Provide doctors with tools to manage their practice.

- **Patient Dashboard**
  - Route: `/patient/dashboard`
  - Components: Upcoming Appointments, Past Appointments, Bills, Prescription Upload
  - Purpose: Allow patients to manage their appointments and prescriptions.

- **Admin Dashboard**
  - Route: `/admin/dashboard`
  - Components: User Management, Document Verification
  - Purpose: Admins manage users and verify doctor documents.

- **Super Admin Dashboard**
  - Route: `/superadmin/dashboard`
  - Components: Admin Management
  - Purpose: Manage admin users.

- **Doctor Listings Page**
  - Route: `/doctors`
  - Components: Doctor Cards, Filters
  - Purpose: Allow patients to browse and book appointments with doctors.

- **Appointment Booking Page**
  - Route: `/appointment/book/:doctorId`
  - Components: Appointment Form
  - Purpose: Allow patients to book appointments with selected doctors.

## 4. API Routes
- **POST /api/auth/signup**
  - Description: Register a new user (Patient/Doctor).
  - Request: `{ "username": "string", "password": "string", "role": "string", "documents": ["file1", "file2"] }`
  - Response: `{ "message": "User registered successfully." }`

- **POST /api/auth/login**
  - Description: Authenticate a user.
  - Request: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "JWT_TOKEN", "role": "string" }`

- **GET /api/doctors**
  - Description: Retrieve list of doctors.
  - Request: `{}`
  - Response: `[ { "id": "number", "name": "string", "specialty": "string", "rating": "number" } ]`

- **POST /api/appointments**
  - Description: Book an appointment.
  - Request: `{ "doctorId": "number", "patientId": "number", "date": "string", "type": "string" }`
  - Response: `{ "message": "Appointment booked successfully." }`

- **GET /api/appointments/:userId**
  - Description: Retrieve appointments for a user.
  - Request: `{}`
  - Response: `[ { "id": "number", "doctorId": "number", "date": "string", "status": "string" } ]`

- **POST /api/admin/verify-doctor**
  - Description: Admin verifies doctor documents.
  - Request: `{ "doctorId": "number", "status": "approved/rejected/request-changes" }`
  - Response: `{ "message": "Status updated." }`

## 5. Database Schema
- **Users Table (MySQL)**
  - Fields: 
    - `id` (INT, PK)
    - `username` (VARCHAR)
    - `password` (VARCHAR)
    - `role` (ENUM: 'patient', 'doctor', 'admin', 'superadmin')
    - `status` (ENUM: 'pending', 'approved', 'rejected')

- **Appointments Table (MySQL)**
  - Fields:
    - `id` (INT, PK)
    - `doctorId` (INT, FK)
    - `patientId` (INT, FK)
    - `date` (DATETIME)
    - `type` (ENUM: 'video', 'audio', 'physical')
    - `status` (ENUM: 'scheduled', 'completed', 'canceled')

- **Documents Collection (MongoDB)**
  - Fields:
    - `id` (ObjectId)
    - `userId` (INT, FK)
    - `documentType` (STRING)
    - `filePath` (STRING)
    - `status` (ENUM: 'pending', 'approved', 'rejected')

- **Prescriptions Collection (MongoDB)**
  - Fields:
    - `id` (ObjectId)
    - `patientId` (INT, FK)
    - `doctorId` (INT, FK)
    - `prescriptionData` (STRING or BINARY for images)
    - `createdAt` (DATETIME)

## 6. Authentication Flow
1. User accesses the login page and submits credentials.
2. Backend validates credentials and generates a JWT token with user role.
3. Token is sent back to the frontend.
4. Frontend stores token (localStorage/sessionStorage).
5. For protected routes, the frontend includes the token in the Authorization header.
6. Backend verifies the token and checks user role for access control.
7. On signup, doctors upload documents which are stored in MongoDB.
8. Admin receives notification of new doctor signups to review documents.
9. Admin approves/rejects documents, updating the user status accordingly. Doctors are notified of the status change.

## 7. Testing Plan
- **Unit Tests**: 
  - Test individual functions and components using Jest for frontend and Mocha/Chai for backend.
  
- **Integration Tests**: 
  - Test interactions between components and APIs, ensuring data flows correctly.
  
- **End-to-End Tests**: 
  - Use Cypress to simulate user interactions on the frontend and validate the entire flow from signup to appointment booking.

## 8. Deployment Plan
- **Frontend**: Deploy the Angular application to Vercel. Set up CI/CD for automatic deployments on push to the main branch.
- **Backend**: Deploy the Node.js/Express server on Railway. Configure environment variables for database connections and JWT secret.
- **Database**: Use Railway to manage MySQL and MongoDB instances. Ensure proper connection strings are set in environment variables.
- **Environment Variables**: 
  - `JWT_SECRET`
  - `MYSQL_HOST`
  - `MYSQL_USER`
  - `MYSQL_PASSWORD`
  - `MONGODB_URI`
- **CI/CD**: Set up GitHub Actions for automated testing and deployment upon merging to the main branch.