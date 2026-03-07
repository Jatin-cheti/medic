import db from '../config/database';

export interface Doctor {
    id?: number;
    name: string;
    email: string;
    password: string;
    experienceCertificate: string;
    degree: string;
    status: 'pending' | 'approved' | 'rejected';
}

export const createDoctor = async (doctor: Doctor) => {
    const [result] = await db.execute(
        'INSERT INTO doctors (name, email, password, experienceCertificate, degree, status) VALUES (?, ?, ?, ?, ?, ?)',
        [doctor.name, doctor.email, doctor.password, doctor.experienceCertificate, doctor.degree, doctor.status]
    );
    return result;
};

export const updateDoctorStatus = async (id: number, status: 'approved' | 'rejected') => {
    await db.execute('UPDATE doctors SET status = ? WHERE id = ?', [status, id]);
};

export const getDoctorById = async (id: number) => {
    const [rows] = await db.execute('SELECT * FROM doctors WHERE id = ?', [id]);
    return rows[0];
};

export const getAllDoctors = async () => {
    const [rows] = await db.execute('SELECT * FROM doctors');
    return rows;
};
