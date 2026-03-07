import express from 'express';
import doctorRoutes from './src/routes/doctorRoutes';
import { errorHandler } from './src/utils/errorHandler';

const app = express();

app.use(express.json());
app.use('/api/doctors', doctorRoutes);
app.use(errorHandler);

export default app;
