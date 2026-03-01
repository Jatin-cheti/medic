'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('appointments', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      scheduled_at: { type: DataTypes.DATE, allowNull: false },
      duration_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      status: { type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'), allowNull: false, defaultValue: 'pending' },
      consultation_type: { type: DataTypes.ENUM('video', 'chat', 'audio'), allowNull: false, defaultValue: 'video' },
      reason: { type: DataTypes.TEXT, allowNull: true },
      symptoms: { type: DataTypes.TEXT, allowNull: true },
      medical_history: { type: DataTypes.TEXT, allowNull: true },
      appointment_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
      confirmed_at: { type: DataTypes.DATE, allowNull: true },
      started_at: { type: DataTypes.DATE, allowNull: true },
      ended_at: { type: DataTypes.DATE, allowNull: true },
      cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
      meeting_link: { type: DataTypes.STRING(1024), allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('appointments', ['uuid']);
    await queryInterface.addIndex('appointments', ['patient_id']);
    await queryInterface.addIndex('appointments', ['doctor_id']);
    await queryInterface.addIndex('appointments', ['status']);
    await queryInterface.addIndex('appointments', ['scheduled_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('appointments');
  }
};
