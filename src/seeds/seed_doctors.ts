import { mysqlConnection } from '../config/database';

const seedDoctors = async () => {
    const connection = await mysqlConnection();
    const doctors = [
        { name: 'Dr. John Doe', specialty: 'Cardiology', status: 'approved' },
        { name: 'Dr. Jane Smith', specialty: 'Neurology', status: 'approved' },
    ];
    for (const doctor of doctors) {
        await connection.execute('INSERT INTO doctors (name, specialty, status) VALUES (?, ?, ?)', [doctor.name, doctor.specialty, doctor.status]);
    }
};

seedDoctors();
