import { db } from '../config/database';

export const seedDoctors = async () => {
    await db.execute(`
        INSERT INTO doctors (name, email, password) VALUES
        ('Dr. John Doe', 'john@example.com', 'hashed_password'),
        ('Dr. Jane Smith', 'jane@example.com', 'hashed_password')
    `);
};
