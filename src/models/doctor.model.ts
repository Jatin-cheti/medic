import { mysqlConnection } from '../config/database';

export const Doctor = {
    async findAll() {
        const connection = await mysqlConnection();
        const [rows] = await connection.execute('SELECT * FROM doctors WHERE status = "approved"');
        return rows;
    },
    async findById(id: number) {
        const connection = await mysqlConnection();
        const [rows] = await connection.execute('SELECT * FROM doctors WHERE id = ?', [id]);
        return rows[0];
    },
};
