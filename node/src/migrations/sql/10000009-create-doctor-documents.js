'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('doctor_documents', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      document_type_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'document_types', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      file_url: { type: DataTypes.STRING(1024), allowNull: false },
      file_name: { type: DataTypes.STRING(255), allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
      rejection_reason: { type: DataTypes.TEXT, allowNull: true },
      verified_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      verified_at: { type: DataTypes.DATE, allowNull: true },
      expiry_date: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('doctor_documents', ['uuid']);
    await queryInterface.addIndex('doctor_documents', ['doctor_id']);
    await queryInterface.addIndex('doctor_documents', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('doctor_documents');
  }
};
