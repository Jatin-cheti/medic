import pool from '../config/database';

export interface Doctor {
    id: number;
    consultationRate: number;
}

export const setConsultationRate = async (doctorId: number, rate: number): Promise<void> => {
    const query = 'UPDATE doctors SET consultationRate = ? WHERE id = ?';
    await pool.execute(query, [rate, doctorId]);
};

export const getConsultationRate = async (doctorId: number): Promise<number> => {
    const query = 'SELECT consultationRate FROM doctors WHERE id = ?';
    const [rows]: any = await pool.execute(query, [doctorId]);
    return rows[0]?.consultationRate || 0;
};
