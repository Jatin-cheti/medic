import { Appointment } from '../models/appointment.model';

export const AppointmentService = {
    async createAppointment(appointmentData: any) {
        return await Appointment.create(appointmentData);
    },
    async getAppointmentsForDoctor(doctorId: number) {
        return await Appointment.findByDoctorId(doctorId);
    },
};
