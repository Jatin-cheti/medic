import { Request, Response } from 'express';
import { setConsultationRate, getConsultationRate } from '../models/Doctor';

export const setConsultationRateController = async (req: Request, res: Response) => {
    const doctorId = parseInt(req.params.id);
    const { rate } = req.body;

    if (typeof rate !== 'number' || rate <= 0) {
        return res.status(400).json({ message: 'Invalid consultation rate' });
    }

    try {
        await setConsultationRate(doctorId, rate);
        res.status(200).json({ message: 'Consultation rate updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating consultation rate' });
    }
};

export const getConsultationRateController = async (req: Request, res: Response) => {
    const doctorId = parseInt(req.params.id);

    try {
        const rate = await getConsultationRate(doctorId);
        res.status(200).json({ consultationRate: rate });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching consultation rate' });
    }
};
