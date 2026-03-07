import express from 'express';
import { mysqlConnection, mongoConnection } from './config/db';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './utils/errorHandler';

const app = express();
app.use(express.json());

app.use('/api/admins', adminRoutes);
app.use(errorHandler);

const startServer = async () => {
    await mysqlConnection();
    await mongoConnection();
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
};

startServer();
