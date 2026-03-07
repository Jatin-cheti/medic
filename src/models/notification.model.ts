import { mysqlConnection } from '../config/database';

export interface Notification {
    id: number;
    doctorId: number;
    message: string;
    status: 'pending' | 'read';
    createdAt: Date;
}

export const createNotification = async (doctorId: number, message: string): Promise<Notification> => {
    const connection = await mysqlConnection();
    const [result] = await connection.execute(
        'INSERT INTO notifications (doctorId, message, status, createdAt) VALUES (?, ?, ?, ?)',
        [doctorId, message, 'pending', new Date()]
    );
    return {
        id: (result as any).insertId,
        doctorId,
        message,
        status: 'pending',
        createdAt: new Date(),
    };
};

export const getNotificationsByDoctorId = async (doctorId: number): Promise<Notification[]> => {
    const connection = await mysqlConnection();
    const [rows] = await connection.execute('SELECT * FROM notifications WHERE doctorId = ?', [doctorId]);
    return rows as Notification[];
};
