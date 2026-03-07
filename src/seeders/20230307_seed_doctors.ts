import db from '../config/database';

const seedDoctors = async () => {
    const doctors = [
        { name: 'Dr. John Doe', email: 'john@example.com', password: 'hashed_password', experienceCertificate: 'cert1.pdf', degree: 'MD', status: 'pending' },
        { name: 'Dr. Jane Smith', email: 'jane@example.com', password: 'hashed_password', experienceCertificate: 'cert2.pdf', degree: 'MD', status: 'pending' },
    ];

    for (const doctor of doctors) {
        await db.execute(
            'INSERT INTO doctors (name, email, password, experienceCertificate, degree, status) VALUES (?, ?, ?, ?, ?, ?)',
            [doctor.name, doctor.email, doctor.password, doctor.experienceCertificate, doctor.degree, doctor.status]
        );
    }
};

seedDoctors().then(() => {
    console.log('Doctors seeded successfully.');
}).catch(err => {
    console.error('Error seeding doctors:', err);
});
