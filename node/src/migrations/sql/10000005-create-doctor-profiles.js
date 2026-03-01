'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('doctor_profiles', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      registration_number: { type: DataTypes.STRING(128), unique: true, allowNull: false },
      bio: { type: DataTypes.TEXT, allowNull: true },
      years_of_experience: { type: DataTypes.INTEGER, allowNull: true },
      clinic_address: { type: DataTypes.TEXT, allowNull: true },
      consultation_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      verification_date: { type: DataTypes.DATE, allowNull: true },
      verified_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      is_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      approval_date: { type: DataTypes.DATE, allowNull: true },
      is_suspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
      total_consultations: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('doctor_profiles', ['uuid']);
    await queryInterface.addIndex('doctor_profiles', ['user_id']);
    await queryInterface.addIndex('doctor_profiles', ['registration_number']);
    await queryInterface.addIndex('doctor_profiles', ['is_verified']);
    await queryInterface.addIndex('doctor_profiles', ['is_approved']);
    await queryInterface.addIndex('doctor_profiles', ['rating']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('doctor_profiles');
  }
};
