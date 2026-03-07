import { mysqlConnection } from '../config/database';

const createAppointmentsTable = async () => {
    const connection = await mysqlConnection();
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            doctor_id INT NOT NULL,
            patient_id INT NOT NULL,
            appointment_type ENUM('video', 'audio', 'physical') NOT NULL,
            date DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id),
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    `);
};

createAppointmentsTable();
