import { createConnection } from 'mysql2/promise';
import mongoose from 'mongoose';

const mysqlConnection = async () => {
    return await createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    });
};

const mongoConnection = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

export { mysqlConnection, mongoConnection };
