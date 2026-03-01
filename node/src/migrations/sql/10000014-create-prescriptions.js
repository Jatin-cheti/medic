'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('prescriptions', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      appointment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'appointments', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      diagnosis: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      file_url: { type: DataTypes.STRING(1024), allowNull: true },
      is_digital: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      issued_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      valid_until: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('prescriptions', ['uuid']);
    await queryInterface.addIndex('prescriptions', ['appointment_id']);
    await queryInterface.addIndex('prescriptions', ['doctor_id']);
    await queryInterface.addIndex('prescriptions', ['patient_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('prescriptions');
  }
};
