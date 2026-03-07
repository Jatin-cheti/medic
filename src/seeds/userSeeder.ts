import { mysqlPool } from '../config/database';

const seedUsers = async () => {
    const users = [
        { username: 'admin', email: 'admin@example.com', password: 'hashed_password', role: 'Admin' },
        { username: 'doctor', email: 'doctor@example.com', password: 'hashed_password', role: 'Doctor' },
        { username: 'patient', email: 'patient@example.com', password: 'hashed_password', role: 'Patient' },
    ];

    const connection = await mysqlPool.getConnection();
    try {
        await connection.beginTransaction();
        for (const user of users) {
            await connection.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            [user.username, user.email, user.password, user.role]);
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error('Seeding error:', error);
    } finally {
        connection.release();
    }
};

seedUsers();
