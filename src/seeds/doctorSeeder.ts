import { getRepository } from 'typeorm';
import { Doctor } from '../models/Doctor';
import bcrypt from 'bcrypt';

export const seedDoctors = async () => {
    const doctorRepository = getRepository(Doctor);
    const hashedPassword = await bcrypt.hash('password123', 10);

    const doctors = [
        {
            name: 'Dr. John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            experienceCertificate: 'path/to/certificate',
            degree: 'MD',
        },
        {
            name: 'Dr. Jane Smith',
            email: 'jane@example.com',
            password: hashedPassword,
            experienceCertificate: 'path/to/certificate',
            degree: 'MBBS',
        },
    ];

    await doctorRepository.save(doctors);
};
