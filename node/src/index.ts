import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use('/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
