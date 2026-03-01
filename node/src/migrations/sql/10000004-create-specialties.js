'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('specialties', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      name: { type: DataTypes.STRING(255), allowNull: false },
      code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon_url: { type: DataTypes.STRING(1024), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('specialties', ['uuid']);
    await queryInterface.addIndex('specialties', ['code']);
    await queryInterface.addIndex('specialties', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('specialties');
  }
};
