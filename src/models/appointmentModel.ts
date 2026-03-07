import db from '../config/database';
import { Appointment } from '../types/appointmentTypes';

export const getAppointmentsByUserId = async (userId: string): Promise<Appointment[]> => {
  const [rows] = await db.execute('SELECT * FROM appointments WHERE user_id = ?', [userId]);
  return rows as Appointment[];
};
