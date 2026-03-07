import { Doctor } from '../models/Doctor';
import { Symptom } from '../models/Symptom';

export class DoctorService {
    public async getDashboardData(doctorId: number) {
        const doctor = await Doctor.findById(doctorId);
        // Fetch additional data as needed
        return { doctor };
    }

    public async uploadSymptom(doctorId: number, symptom: string) {
        await Symptom.create(symptom, doctorId);
    }
}
