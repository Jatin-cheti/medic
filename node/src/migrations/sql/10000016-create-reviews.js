'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('reviews', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      appointment_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'appointments', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false },
      review_text: { type: DataTypes.TEXT, allowNull: true },
      would_recommend: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_anonymous: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_approved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_flagged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('reviews', ['uuid']);
    await queryInterface.addIndex('reviews', ['doctor_id']);
    await queryInterface.addIndex('reviews', ['patient_id']);
    await queryInterface.addIndex('reviews', ['is_approved']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('reviews');
  }
};
