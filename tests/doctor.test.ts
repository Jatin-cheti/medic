import request from 'supertest';
import app from '../app';

describe('Doctor Approval Process', () => {
    it('should approve a doctor', async () => {
        const response = await request(app)
            .put('/api/doctors/approve/1')
            .set('Authorization', 'Bearer your_jwt_token'); // Replace with a valid token
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Doctor approved successfully.');
    });

    it('should reject a doctor', async () => {
        const response = await request(app)
            .put('/api/doctors/reject/1')
            .set('Authorization', 'Bearer your_jwt_token'); // Replace with a valid token
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Doctor rejected successfully.');
    });

    it('should get all doctors', async () => {
        const response = await request(app)
            .get('/api/doctors')
            .set('Authorization', 'Bearer your_jwt_token'); // Replace with a valid token
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
