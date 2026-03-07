import express from 'express';
import doctorRoutes from './routes/doctorRoutes';
import errorHandler from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api', doctorRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
