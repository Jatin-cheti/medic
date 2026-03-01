'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('conversations', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      appointment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, references: { model: 'appointments', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      type: { type: DataTypes.ENUM('appointment_chat', 'direct_message'), allowNull: false, defaultValue: 'appointment_chat' },
      last_message_at: { type: DataTypes.DATE, allowNull: true },
      is_archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('conversations', ['uuid']);
    await queryInterface.addIndex('conversations', ['patient_id']);
    await queryInterface.addIndex('conversations', ['doctor_id']);
    await queryInterface.addIndex('conversations', ['appointment_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('conversations');
  }
};
