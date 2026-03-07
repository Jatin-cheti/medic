import request from 'supertest';
import app from '../../app'; // Assuming your Express app is exported from this file
import { setupDatabase, teardownDatabase } from '../utils/database'; // Utility functions for DB setup/teardown
import { User } from '../../models/User'; // User model
import { Document } from '../../models/Document'; // Document model

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Admin Features', () => {
  let adminToken;
  let doctorId;

  beforeEach(async () => {
    // Create an admin user and get the token
    const adminResponse = await request(app)
      .post('/auth/signup')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'Admin' });
    
    adminToken = adminResponse.body.token;

    // Create a doctor user for testing
    const doctorResponse = await request(app)
      .post('/auth/signup')
      .send({ name: 'Doctor', email: 'doctor@example.com', password: 'doctor123', role: 'Doctor' });
    
    doctorId = doctorResponse.body.userId; // Assuming the response contains the userId
  });

  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
    await Document.deleteMany({});
  });

  describe('POST /admin/verify-doctor', () => {
    it('should approve a doctor document', async () => {
      const documentResponse = await request(app)
        .post('/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: doctorId, files: ['certificate.pdf'] });

      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ doctorId, status: 'Approved' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor approved successfully');

      const doctor = await User.findById(doctorId);
      expect(doctor.status).toBe('Approved');
    });

    it('should reject a doctor document', async () => {
      const documentResponse = await request(app)
        .post('/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: doctorId, files: ['certificate.pdf'] });

      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ doctorId, status: 'Rejected', comments: 'Incomplete documents' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor rejected successfully');

      const doctor = await User.findById(doctorId);
      expect(doctor.status).toBe('Rejected');
    });

    it('should return an error if doctor does not exist', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ doctorId: 'nonexistentId', status: 'Approved' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Doctor not found');
    });

    it('should return an error if not authorized', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .send({ doctorId, status: 'Approved' }); // No token provided

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('POST /admin/add-admin', () => {
    it('should add a new admin', async () => {
      const response = await request(app)
        .post('/admin/add-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Admin', email: 'newadmin@example.com', password: 'newadmin123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin added successfully');

      const newAdmin = await User.findOne({ email: 'newadmin@example.com' });
      expect(newAdmin).not.toBeNull();
      expect(newAdmin.role).toBe('Admin');
    });

    it('should return an error if admin already exists', async () => {
      await request(app)
        .post('/admin/add-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Existing Admin', email: 'existingadmin@example.com', password: 'existingadmin123' });

      const response = await request(app)
        .post('/admin/add-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Existing Admin', email: 'existingadmin@example.com', password: 'existingadmin123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Admin already exists');
    });

    it('should return an error if not authorized', async () => {
      const response = await request(app)
        .post('/admin/add-admin')
        .send({ name: 'Unauthorized Admin', email: 'unauthorized@example.com', password: 'unauthorized123' }); // No token provided

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
