'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('languages', [
      { uuid: uuidv4(), code: 'en', name: 'English', native_name: 'English', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'hi', name: 'Hindi', native_name: 'हिंदी', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'pa', name: 'Punjabi', native_name: 'ਪੰਜਾਬੀ', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'ml', name: 'Malayalam', native_name: 'മലയാളം', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'ta', name: 'Tamil', native_name: 'தமிழ்', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'te', name: 'Telugu', native_name: 'తెలుగు', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'bn', name: 'Bengali', native_name: 'বাংলা', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), code: 'mr', name: 'Marathi', native_name: 'मराठी', is_active: true, created_at: now, updated_at: now }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('languages', {}, {});
  }
};
