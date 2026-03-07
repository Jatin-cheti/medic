import { Request, Response } from 'express';
import { Appointment } from '../models/appointment.model';

export const bookAppointment = async (req: Request, res: Response) => {
    const appointmentData = req.body;
    try {
        const appointmentId = await Appointment.create(appointmentData);
        res.status(201).json({ message: 'Appointment booked successfully', appointmentId });
    } catch (error) {
        res.status(500).json({ message: 'Error booking appointment' });
    }
};

export const getAppointmentsByDoctorId = async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    try {
        const appointments = await Appointment.findByDoctorId(Number(doctorId));
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};
