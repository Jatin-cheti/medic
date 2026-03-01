'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('roles', [
      {
        uuid: uuidv4(),
        name: 'patient',
        description: 'Patient user role',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        name: 'doctor',
        description: 'Doctor/medical professional role',
        created_at: now,
        updated_at: now
      },
      {
        uuid: uuidv4(),
        name: 'admin',
        description: 'Administrator role',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', {}, {});
  }
};
