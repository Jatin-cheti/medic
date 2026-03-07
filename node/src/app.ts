import express from 'express';
import bodyParser from 'body-parser';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middlewares/errorMiddleware';

const app = express();

app.use(bodyParser.json());
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

export default app;
