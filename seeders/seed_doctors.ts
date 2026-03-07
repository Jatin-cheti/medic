import db from '../src/config/db';

const seedDoctors = async () => {
    await db.execute(`
        INSERT INTO doctors (name, email, password, status) VALUES
        ('Dr. John Doe', 'john@example.com', 'hashed_password', 'approved'),
        ('Dr. Jane Smith', 'jane@example.com', 'hashed_password', 'pending')
    `);
};

seedDoctors().then(() => {
    console.log('Doctors seeded');
}).catch(err => {
    console.error('Error seeding doctors:', err);
});
