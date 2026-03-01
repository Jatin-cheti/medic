'use strict';
const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('roles', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      name: { type: DataTypes.ENUM('patient', 'doctor', 'admin'), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('roles', ['uuid']);
    await queryInterface.addIndex('roles', ['name']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('roles');
  }
};
