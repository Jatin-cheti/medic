import db from '../config/db';

const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('patient', 'doctor', 'admin', 'super_admin') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await db.execute(query);
};

createUsersTable().then(() => {
    console.log('Users table created successfully.');
}).catch(err => {
    console.error('Error creating users table:', err);
});
