'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('doctor_specialties', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      specialty_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'specialties', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('doctor_specialties', ['doctor_id']);
    await queryInterface.addIndex('doctor_specialties', ['specialty_id']);
    await queryInterface.addConstraint('doctor_specialties', {
      fields: ['doctor_id', 'specialty_id'],
      type: 'unique',
      name: 'unique_doctor_specialty'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('doctor_specialties');
  }
};
