import Prescription, { IPrescription } from '../models/prescription.model';

class PrescriptionService {
  async savePrescription(data: any, file: Express.Multer.File): Promise<IPrescription> {
    const prescriptionData = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      prescriptionText: data.prescriptionText,
      prescriptionImage: file ? file.path : undefined,
    };

    const prescription = new Prescription(prescriptionData);
    return await prescription.save();
  }
}

export default new PrescriptionService();
