'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('payments', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      appointment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'appointments', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      payment_method_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'payment_methods', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
      transaction_id: { type: DataTypes.STRING(255), allowNull: true },
      payment_reference: { type: DataTypes.STRING(255), allowNull: true },
      refund_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      refund_reason: { type: DataTypes.TEXT, allowNull: true },
      refund_date: { type: DataTypes.DATE, allowNull: true },
      paid_at: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('payments', ['uuid']);
    await queryInterface.addIndex('payments', ['appointment_id']);
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['transaction_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
  }
};
