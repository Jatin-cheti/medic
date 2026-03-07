import { Op } from 'sequelize';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';

class AppointmentService {
  async getAppointments(userId: number, role: string, type: string) {
    const now = new Date();

    const whereClause = {
      [role === 'Doctor' ? 'doctorId' : 'patientId']: userId,
      ...(type === 'upcoming'
        ? { date: { [Op.gte]: now } }
        : { date: { [Op.lt]: now } }),
    };

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: role === 'Doctor' ? 'patient' : 'doctor',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['date', 'ASC']],
    });

    return appointments;
  }
}

export const appointmentService = new AppointmentService();
