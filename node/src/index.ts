import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin.routes';
import doctorRoutes from './routes/doctor.routes';
import profileRoutes from './routes/profile';
import { appointmentRouter } from './routes/appointment.routes';
import notificationRoutes from './routes/notificationRoutes';
import prescriptionRoutes from './routes/prescription.routes';
import symptomCheckerRoutes from './routes/symptomChecker.routes';
import superAdminRoutes from './routes/superadmin.routes';
import dashboardRoutes from './routes/dashboard';
import documentRoutes from './routes/documentRoutes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'https://medic-cf1u6bwpy-jatin-chetis-projects.vercel.app',
    'http://localhost:4200',
    'http://localhost:3000',
  ];
  const origin = req.headers.origin as string;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Healthcheck — required for Railway deployment probe
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'Medic API', version: '1.0.0' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/appointments', appointmentRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/symptom-checker', symptomCheckerRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
