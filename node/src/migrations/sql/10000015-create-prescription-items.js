'use strict';

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('prescription_items', {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.STRING(36), unique: true, allowNull: false },
      prescription_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: 'prescriptions', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      medicine_name: { type: DataTypes.STRING(255), allowNull: false },
      dosage: { type: DataTypes.STRING(128), allowNull: false },
      frequency: { type: DataTypes.STRING(128), allowNull: false },
      duration: { type: DataTypes.STRING(128), allowNull: true },
      instructions: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('prescription_items', ['uuid']);
    await queryInterface.addIndex('prescription_items', ['prescription_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('prescription_items');
  }
};
