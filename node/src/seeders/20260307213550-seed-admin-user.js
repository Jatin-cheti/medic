'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('superadminpassword', 10);
    await queryInterface.bulkInsert('users', [
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'SuperAdmin',
        status: 'Approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'superadmin@example.com' });
  },
};
