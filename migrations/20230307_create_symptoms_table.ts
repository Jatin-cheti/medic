import { db } from '../config/database';

export const createSymptomsTable = async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS symptoms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            symptom TEXT NOT NULL,
            doctor_id INT,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id)
        )
    `);
};
