'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('availability_slots', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      day_of_week: { type: DataTypes.INTEGER, allowNull: false },
      start_time: { type: DataTypes.TIME, allowNull: false },
      end_time: { type: DataTypes.TIME, allowNull: false },
      slot_duration_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('availability_slots', ['uuid']);
    await queryInterface.addIndex('availability_slots', ['doctor_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('availability_slots');
  }
};
