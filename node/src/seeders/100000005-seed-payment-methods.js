'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('payment_methods', [
      { uuid: uuidv4(), name: 'Credit Card', code: 'CREDIT_CARD', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Debit Card', code: 'DEBIT_CARD', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'UPI', code: 'UPI', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Net Banking', code: 'NET_BANKING', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Wallet', code: 'WALLET', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Google Pay', code: 'GOOGLE_PAY', is_active: true, created_at: now, updated_at: now },
      { uuid: uuidv4(), name: 'Apple Pay', code: 'APPLE_PAY', is_active: true, created_at: now, updated_at: now }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('payment_methods', {}, {});
  }
};
