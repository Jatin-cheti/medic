'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('Prescriptions', [
            {
                patientId: 'patient1',
                doctorId: 'doctor1',
                prescriptionText: 'Take two tablets daily',
                prescriptionImage: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('Prescriptions', null, {});
    },
};
