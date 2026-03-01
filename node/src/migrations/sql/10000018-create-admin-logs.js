'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('admin_logs', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      admin_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      action: { type: DataTypes.STRING(255), allowNull: false },
      target_user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      target_doctor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, references: { model: 'doctor_profiles', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      description: { type: DataTypes.TEXT, allowNull: true },
      changes: { type: DataTypes.JSON, allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
      user_agent: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('admin_logs', ['uuid']);
    await queryInterface.addIndex('admin_logs', ['admin_id']);
    await queryInterface.addIndex('admin_logs', ['action']);
    await queryInterface.addIndex('admin_logs', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('admin_logs');
  }
};
