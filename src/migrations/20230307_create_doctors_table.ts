import db from '../config/database';

const createDoctorsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            experienceCertificate VARCHAR(255) NOT NULL,
            degree VARCHAR(255) NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
        )
    `);
};

createDoctorsTable().then(() => {
    console.log('Doctors table created successfully.');
}).catch(err => {
    console.error('Error creating doctors table:', err);
});
