import { Doctor } from '../models/Doctor';

const seedDoctors = async () => {
    const doctors = [
        { name: 'Dr. John Doe', specialization: 'Cardiology', consultationRate: 100 },
        { name: 'Dr. Jane Smith', specialization: 'Neurology', consultationRate: 120 },
    ];

    await Doctor.insertMany(doctors);
};

export default seedDoctors;
