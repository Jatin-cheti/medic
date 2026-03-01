'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const patientPassword = bcrypt.hashSync('patient123', 10);
    const doctorPassword = bcrypt.hashSync('doctor123', 10);
    const adminPassword = bcrypt.hashSync('admin123', 10);

    // Get role IDs
    const [patientRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'patient' LIMIT 1"
    );
    const [doctorRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'doctor' LIMIT 1"
    );
    const [adminRole] = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
    );

    const patientRoleId = patientRole[0]?.id || 1;
    const doctorRoleId = doctorRole[0]?.id || 2;
    const adminRoleId = adminRole[0]?.id || 3;

    await queryInterface.bulkInsert('users', [
      // Admin
      {
        uuid: uuidv4(),
        role_id: adminRoleId,
        email: 'admin@medic.com',
        phone: '+919876543210',
        password_hash: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'en',
        created_at: now,
        updated_at: now
      },
      // Doctors
      {
        uuid: uuidv4(),
        role_id: doctorRoleId,
        email: 'dr.rajesh@medic.com',
        phone: '+919123456789',
        password_hash: doctorPassword,
        first_name: 'Rajesh',
        last_name: 'Kumar',
        date_of_birth: new Date('1980-05-15'),
        gender: 'male',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'hi',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: doctorRoleId,
        email: 'dr.priya@medic.com',
        phone: '+919234567890',
        password_hash: doctorPassword,
        first_name: 'Priya',
        last_name: 'Singh',
        date_of_birth: new Date('1985-08-20'),
        gender: 'female',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'en',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: doctorRoleId,
        email: 'dr.sunil@medic.com',
        phone: '+919345678901',
        password_hash: doctorPassword,
        first_name: 'Sunil',
        last_name: 'Patel',
        date_of_birth: new Date('1982-03-10'),
        gender: 'male',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'en',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: doctorRoleId,
        email: 'dr.anjali@medic.com',
        phone: '+919456789012',
        password_hash: doctorPassword,
        first_name: 'Anjali',
        last_name: 'Sharma',
        date_of_birth: new Date('1988-11-25'),
        gender: 'female',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'hi',
        created_at: now,
        updated_at: now
      },
      // Patients
      {
        uuid: uuidv4(),
        role_id: patientRoleId,
        email: 'patient1@medic.com',
        phone: '+919111111111',
        password_hash: patientPassword,
        first_name: 'Arjun',
        last_name: 'Verma',
        date_of_birth: new Date('1990-07-12'),
        gender: 'male',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'en',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: patientRoleId,
        email: 'patient2@medic.com',
        phone: '+919222222222',
        password_hash: patientPassword,
        first_name: 'Neha',
        last_name: 'Gupta',
        date_of_birth: new Date('1992-04-28'),
        gender: 'female',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'hi',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: patientRoleId,
        email: 'patient3@medic.com',
        phone: '+919333333333',
        password_hash: patientPassword,
        first_name: 'Vikram',
        last_name: 'Singh',
        date_of_birth: new Date('1988-09-05'),
        gender: 'male',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'pa',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        role_id: patientRoleId,
        email: 'patient4@medic.com',
        phone: '+919444444444',
        password_hash: patientPassword,
        first_name: 'Divya',
        last_name: 'Nair',
        date_of_birth: new Date('1995-01-18'),
        gender: 'female',
        is_verified: true,
        is_active: true,
        is_suspended: false,
        preferred_language: 'ml',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {}, {});
  }
};
