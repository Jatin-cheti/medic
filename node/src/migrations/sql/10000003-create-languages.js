'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('languages', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      code: { type: DataTypes.STRING(10), unique: true, allowNull: false },
      name: { type: DataTypes.STRING(128), allowNull: false },
      native_name: { type: DataTypes.STRING(128), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('languages', ['uuid']);
    await queryInterface.addIndex('languages', ['code']);
    await queryInterface.addIndex('languages', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('languages');
  }
};
