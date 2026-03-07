import { Appointment } from '../models/Appointment';

const seedAppointments = async () => {
    const appointments = [
        { patientId: '60d5ec49f1b2c1b1f8e1e1e1', doctorId: '60d5ec49f1b2c1b1f8e1e1e2', appointmentType: 'video', date: new Date() },
        { patientId: '60d5ec49f1b2c1b1f8e1e1e1', doctorId: '60d5ec49f1b2c1b1f8e1e1e3', appointmentType: 'physical', date: new Date() },
    ];

    await Appointment.insertMany(appointments);
};

export default seedAppointments;
