import { Appointment } from '../models/appointment.model';

interface AppointmentData {
  doctorId: number;
  patientId: number;
  type: 'Video' | 'Audio' | 'Physical';
  date: string;
  time: string;
}

export class AppointmentService {
  static async createAppointment(data: AppointmentData) {
    return await Appointment.create(data);
  }

  static async getAppointmentsByUserId(userId: number) {
    return await Appointment.findAll({
      where: {
        [userId]: userId,
      },
    });
  }
}
