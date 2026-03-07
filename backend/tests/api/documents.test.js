import request from 'supertest';
import app from '../../app'; // Assuming your Express app is exported from app.js
import { Document } from '../../models/document'; // Assuming you have a Document model
import { User } from '../../models/user'; // Assuming you have a User model
import mongoose from 'mongoose';

describe('Document Verification API', () => {
  let adminToken;
  let doctorId;

  beforeAll(async () => {
    // Create a mock admin user and get a token
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password',
      role: 'Admin',
      status: 'Approved'
    });
    adminToken = 'Bearer ' + adminUser.generateAuthToken(); // Assuming you have a method to generate JWT

    // Create a mock doctor user
    const doctorUser = await User.create({
      name: 'Doctor User',
      email: 'doctor@example.com',
      password: 'password',
      role: 'Doctor',
      status: 'Pending'
    });
    doctorId = doctorUser._id;

    // Create a mock document for the doctor
    await Document.create({
      userId: doctorId,
      type: 'Certificate',
      filePath: 'path/to/certificate.pdf',
      uploadedAt: new Date()
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Document.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /admin/verify-doctor', () => {
    it('should approve doctor documents successfully', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', adminToken)
        .send({
          doctorId: doctorId,
          status: 'Approved'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor document approved successfully.');

      const updatedDoctor = await User.findById(doctorId);
      expect(updatedDoctor.status).toBe('Approved');
    });

    it('should reject doctor documents successfully', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', adminToken)
        .send({
          doctorId: doctorId,
          status: 'Rejected',
          comments: 'Incomplete documents.'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Doctor document rejected successfully.');

      const updatedDoctor = await User.findById(doctorId);
      expect(updatedDoctor.status).toBe('Rejected');
    });

    it('should return an error if doctorId is invalid', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .set('Authorization', adminToken)
        .send({
          doctorId: 'invalidId',
          status: 'Approved'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid doctor ID.');
    });

    it('should return an error if not authorized', async () => {
      const response = await request(app)
        .post('/admin/verify-doctor')
        .send({
          doctorId: doctorId,
          status: 'Approved'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized access.');
    });
  });
});
