import request from 'supertest';
import app from '../app'; // Assuming your Express app is exported from this file

describe('Auth Routes', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'newuser', password: 'password123', role: 'doctor', documents: [] });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully.');
    });

    it('should return an error for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'newuser' }); // Missing password and role

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'existinguser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('role');
    });

    it('should return an error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
