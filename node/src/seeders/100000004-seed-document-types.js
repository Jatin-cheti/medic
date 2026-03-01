'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('document_types', [
      { uuid: uuidv4(), name: 'Medical Degree', code: 'DEGREE', description: 'Medical degree certificate (MBBS, BDS, etc.)', is_required: true, is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Medical License', code: 'LICENSE', description: 'Medical practice license', is_required: true, is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Government ID', code: 'GOV_ID', description: 'Aadhar, Passport, or other government ID', is_required: true, is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Specialization Certificate', code: 'SPEC_CERT', description: 'Certificate for medical specialization', is_required: false, is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Insurance Certificate', code: 'INS_CERT', description: 'Professional liability insurance', is_required: false, is_active: true, created_at: now, updated_at: now }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('document_types', {}, {});
  }
};
