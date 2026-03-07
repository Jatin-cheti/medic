import request from 'supertest';
import app from '../app';
import { mockDb } from '../__mocks__/mockDb';

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = { username: 'testUser', password: 'password123', role: 'doctor' };
      const response = await request(app).post('/api/auth/signup').send(userData);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully.');
    });

    it('should return an error if user already exists', async () => {
      const userData = { username: 'existingUser', password: 'password123', role: 'doctor' };
      await request(app).post('/api/auth/signup').send(userData); // Create user first
      const response = await request(app).post('/api/auth/signup').send(userData);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate a user successfully', async () => {
      const userData = { username: 'testUser', password: 'password123' };
      const response = await request(app).post('/api/auth/login').send(userData);
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.role).toBe('doctor');
    });

    it('should return an error if credentials are invalid', async () => {
      const userData = { username: 'wrongUser', password: 'wrongPassword' };
      const response = await request(app).post('/api/auth/login').send(userData);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });
  });
});
