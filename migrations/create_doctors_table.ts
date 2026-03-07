import db from '../src/config/db';

const createDoctorsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            documents VARCHAR(255),
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

createDoctorsTable().then(() => {
    console.log('Doctors table created');
}).catch(err => {
    console.error('Error creating doctors table:', err);
});
