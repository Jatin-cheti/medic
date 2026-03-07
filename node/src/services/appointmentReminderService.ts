import { Appointment } from '../models/mysql/Appointment';
import { User } from '../models/mysql/User';
import { sendEmail } from '../utils/emailService';
import { CustomError } from '../utils/CustomError';

export const sendAppointmentReminderService = async (appointmentId: number) => {
  // Fetch appointment details
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [
      { model: User, as: 'doctor', attributes: ['name', 'email'] },
      { model: User, as: 'patient', attributes: ['name', 'email'] },
    ],
  });

  if (!appointment) {
    throw new CustomError('Appointment not found', 404);
  }

  if (appointment.status !== 'Scheduled') {
    throw new CustomError('Cannot send reminders for non-scheduled appointments', 400);
  }

  const { doctor, patient, date, time } = appointment;

  // Compose email content
  const emailContent = `
    Dear ${patient.name},

    This is a reminder for your upcoming appointment with Dr. ${doctor.name}.
    Date: ${date}
    Time: ${time}

    Please ensure you are available at the scheduled time.

    Regards,
    Medic Team
  `;

  // Send email to patient
  await sendEmail(patient.email, 'Appointment Reminder', emailContent);

  return { appointmentId, patientEmail: patient.email };
};
