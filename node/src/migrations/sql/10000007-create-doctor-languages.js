'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('doctor_languages', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      language_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'languages', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      proficiency_level: { type: DataTypes.ENUM('basic', 'intermediate', 'fluent'), allowNull: false, defaultValue: 'fluent' },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('doctor_languages', ['doctor_id']);
    await queryInterface.addIndex('doctor_languages', ['language_id']);
    await queryInterface.addConstraint('doctor_languages', {
      fields: ['doctor_id', 'language_id'],
      type: 'unique',
      name: 'unique_doctor_language'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('doctor_languages');
  }
};
