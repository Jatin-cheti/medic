'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('document_types', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      name: { type: DataTypes.STRING(128), allowNull: false },
      code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('document_types', ['uuid']);
    await queryInterface.addIndex('document_types', ['code']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('document_types');
  }
};
