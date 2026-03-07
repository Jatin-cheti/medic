import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('notifications', [
      {
        userId: 1,
        type: 'statusUpdate',
        message: 'Your account has been approved by the admin.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 2,
        type: 'appointmentReminder',
        message: 'You have an appointment scheduled for tomorrow at 10:00 AM.',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('notifications', {});
  },
};
