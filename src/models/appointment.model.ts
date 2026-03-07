import { mysqlConnection } from '../config/database';

export const Appointment = {
    async create(appointmentData: any) {
        const connection = await mysqlConnection();
        const [result] = await connection.execute('INSERT INTO appointments SET ?', [appointmentData]);
        return result.insertId;
    },
    async findByDoctorId(doctorId: number) {
        const connection = await mysqlConnection();
        const [rows] = await connection.execute('SELECT * FROM appointments WHERE doctor_id = ?', [doctorId]);
        return rows;
    },
};
