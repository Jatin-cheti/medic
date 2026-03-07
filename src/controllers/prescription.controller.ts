import { Request, Response } from 'express';
import PrescriptionService from '../services/prescription.service';

class PrescriptionController {
  async savePrescription(req: Request, res: Response) {
    try {
      const prescription = await PrescriptionService.savePrescription(req.body, req.file);
      return res.status(201).json({ message: 'Prescription saved successfully', prescription });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export default new PrescriptionController();
