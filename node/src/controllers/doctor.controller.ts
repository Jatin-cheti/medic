import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
  private doctorService: DoctorService;

  constructor() {
    this.doctorService = new DoctorService();
  }

  public setConsultationRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const doctorId = req.user.id; // Assuming `req.user` contains the authenticated user's data
      const { rate } = req.body;

      await this.doctorService.setConsultationRate(doctorId, rate);

      res.status(200).json({ message: 'Consultation rate updated successfully.' });
    } catch (error) {
      next(error);
    }
  };
}
