'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // Get doctor user IDs
    const [doctors] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email IN ('dr.rajesh@medic.com', 'dr.priya@medic.com', 'dr.sunil@medic.com', 'dr.anjali@medic.com')"
    );

    if (doctors.length >= 4) {
      await queryInterface.bulkInsert('doctor_profiles', [
        {
          uuid: uuidv4(),
          user_id: doctors[0].id,
          registration_number: 'MCI-001234',
          bio: 'Experienced cardiologist with 10+ years of practice. Specializing in heart disease treatment and prevention.',
          years_of_experience: 12,
          clinic_address: '123 Medical Plaza, Delhi, India',
          consultation_fee: 500.00,
          is_verified: true,
          verification_date: now,
          is_approved: true,
          approval_date: now,
          rating: 4.8,
          total_consultations: 450,
          created_at: now,
          updated_at: now
        },
        {
          uuid: uuidv4(),
          user_id: doctors[1].id,
          registration_number: 'MCI-001235',
          bio: 'Expert dermatologist specializing in skin diseases, cosmetic treatments, and holistic skincare.',
          years_of_experience: 8,
          clinic_address: '456 Health Center, Mumbai, India',
          consultation_fee: 400.00,
          is_verified: true,
          verification_date: now,
          is_approved: true,
          approval_date: now,
          rating: 4.6,
          total_consultations: 320,
          created_at: now,
          updated_at: now
        },
        {
          uuid: uuidv4(),
          user_id: doctors[2].id,
          registration_number: 'MCI-001236',
          bio: 'General practitioner providing comprehensive primary care and health consultations.',
          years_of_experience: 15,
          clinic_address: '789 Wellness Clinic, Bangalore, India',
          consultation_fee: 300.00,
          is_verified: true,
          verification_date: now,
          is_approved: true,
          approval_date: now,
          rating: 4.7,
          total_consultations: 650,
          created_at: now,
          updated_at: now
        },
        {
          uuid: uuidv4(),
          user_id: doctors[3].id,
          registration_number: 'MCI-001237',
          bio: 'Child health specialist with expertise in pediatric diseases and child development.',
          years_of_experience: 9,
          clinic_address: '321 Kids Health, Hyderabad, India',
          consultation_fee: 350.00,
          is_verified: true,
          verification_date: now,
          is_approved: true,
          approval_date: now,
          rating: 4.9,
          total_consultations: 280,
          created_at: now,
          updated_at: now
        }
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('doctor_profiles', {}, {});
  }
};
