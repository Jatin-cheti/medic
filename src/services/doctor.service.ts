import { Doctor } from '../models/doctor.model';

export const DoctorService = {
    async getAllDoctors() {
        return await Doctor.findAll();
    },
    async getDoctorDetails(id: number) {
        return await Doctor.findById(id);
    },
};
