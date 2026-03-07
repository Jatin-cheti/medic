import { getRepository } from 'typeorm';
import { Appointment } from '../models/Appointment';
import nodemailer from 'nodemailer';

class AppointmentService {
    async sendReminder(appointmentId: string) {
        const appointmentRepo = getRepository(Appointment);
        const appointment = await appointmentRepo.findOne(appointmentId);

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        // Logic to send email reminder
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: appointment.patientId, // Assuming patientId is an email
            subject: 'Appointment Reminder',
            text: `You have an appointment scheduled on ${appointment.appointmentDate}`,
        };

        await transporter.sendMail(mailOptions);
        appointment.reminderSent = true;
        await appointmentRepo.save(appointment);

        return true;
    }
}

export default new AppointmentService();
