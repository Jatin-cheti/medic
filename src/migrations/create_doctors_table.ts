import { mysqlConnection } from '../config/database';

const createDoctorsTable = async () => {
    const connection = await mysqlConnection();
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            specialty VARCHAR(255) NOT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
};

createDoctorsTable();
