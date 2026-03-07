import request from 'supertest';
import app from '../../app'; // Assuming your Express app is exported from this file
import { sequelize } from '../../models'; // Assuming Sequelize instance is exported from this file
import { Appointment } from '../../models/Appointment'; // Import your Appointment model

describe('POST /appointments/set-rate', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true }); // Reset the database before tests
    });

    afterEach(async () => {
        await Appointment.destroy({ where: {} }); // Clean up after each test
    });

    it('should set consultation rate successfully for a doctor', async () => {
        const doctorId = 1; // Assuming a doctor with this ID exists
        const rate = 100;

        const response = await request(app)
            .post('/appointments/set-rate')
            .send({ doctorId, rate })
            .expect(200);

        expect(response.body.message).toBe('Consultation rate set successfully');
        const appointment = await Appointment.findOne({ where: { doctorId } });
        expect(appointment.rate).toBe(rate);
    });

    it('should return an error if doctor does not exist', async () => {
        const doctorId = 999; // Non-existing doctor ID
        const rate = 100;

        const response = await request(app)
            .post('/appointments/set-rate')
            .send({ doctorId, rate })
            .expect(404);

        expect(response.body.message).toBe('Doctor not found');
    });

    it('should return an error if rate is invalid', async () => {
        const doctorId = 1; // Assuming a doctor with this ID exists
        const rate = -50; // Invalid rate

        const response = await request(app)
            .post('/appointments/set-rate')
            .send({ doctorId, rate })
            .expect(400);

        expect(response.body.message).toBe('Invalid consultation rate');
    });
});
