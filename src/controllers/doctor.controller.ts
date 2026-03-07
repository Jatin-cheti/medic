import { Request, Response } from 'express';
import { Doctor } from '../models/doctor.model';

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await Doctor.findAll();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors' });
    }
};

export const getDoctorById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doctor = await Doctor.findById(id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor' });
    }
};
