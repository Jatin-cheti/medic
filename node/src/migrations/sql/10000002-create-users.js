'use strict';
const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('users', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      role_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
      email: { type: DataTypes.STRING(255), unique: true, allowNull: true },
      phone: { type: DataTypes.STRING(20), unique: true, allowNull: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: true },
      first_name: { type: DataTypes.STRING(128), allowNull: true },
      last_name: { type: DataTypes.STRING(128), allowNull: true },
      avatar_url: { type: DataTypes.STRING(1024), allowNull: true },
      date_of_birth: { type: DataTypes.DATE, allowNull: true },
      gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
      is_verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_suspended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      suspension_reason: { type: DataTypes.TEXT, allowNull: true },
      preferred_language: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'en' },
      metadata: { type: DataTypes.JSON, allowNull: true },
      last_login: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('users', ['uuid']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phone']);
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.addIndex('users', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
