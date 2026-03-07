import Prescription, { IPrescription } from '../models/prescription.model';

class PrescriptionService {
  async uploadPrescription(data: { userId: number; type: 'Image' | 'Text'; filePath: string }) {
    const prescription = new Prescription(data);
    return await prescription.save();
  }

  async getPrescriptionsByUser(userId: number): Promise<IPrescription[]> {
    return await Prescription.find({ userId });
  }
}

export default new PrescriptionService();
