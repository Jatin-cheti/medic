import { Request, Response, NextFunction } from 'express';
import PrescriptionService from '../services/prescription.service';

class PrescriptionController {
  async uploadPrescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, type } = req.body;
      const filePath = req.file?.path;
      if (!filePath) {
        return res.status(400).json({ message: 'File is required' });
      }
      const prescription = await PrescriptionService.uploadPrescription({ userId, type, filePath });
      res.status(201).json({ message: 'Prescription uploaded successfully', prescription });
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const prescriptions = await PrescriptionService.getPrescriptionsByUser(parseInt(userId));
      res.status(200).json({ prescriptions });
    } catch (error) {
      next(error);
    }
  }
}

export default new PrescriptionController();
