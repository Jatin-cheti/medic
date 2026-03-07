'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Prescriptions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            patientId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            doctorId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            prescriptionText: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            prescriptionImage: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('Prescriptions');
    },
};
