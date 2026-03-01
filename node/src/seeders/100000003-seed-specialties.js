'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('specialties', [
      { uuid: uuidv4(), name: 'General Practitioner', code: 'GP', description: 'General medical practice', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Cardiology', code: 'CARDIO', description: 'Heart and cardiovascular diseases', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Dermatology', code: 'DERM', description: 'Skin diseases and treatment', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Orthopedics', code: 'ORTHO', description: 'Bones and joint diseases', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Neurology', code: 'NEURO', description: 'Nervous system diseases', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Psychiatry', code: 'PSYCH', description: 'Mental health treatment', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Pediatrics', code: 'PEDS', description: 'Children healthcare', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Gynecology', code: 'GYN', description: 'Womens health', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Ophthalmology', code: 'OPTH', description: 'Eye diseases and treatment', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Dentistry', code: 'DENT', description: 'Dental care', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Ayurveda', code: 'AYUR', description: 'Traditional Ayurvedic medicine', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Homeopathy', code: 'HOMO', description: 'Homeopathic medicine', is_active: true, created_at: now, updated_at: now }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('specialties', {}, {});
  }
};
