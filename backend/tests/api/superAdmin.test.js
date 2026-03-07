import request from 'supertest';
import app from '../../src/app'; // Assuming your Express app is exported from this file
import { User } from '../../src/models/User'; // Assuming you have a User model
import { connectDB, disconnectDB } from '../../src/config/db'; // Database connection functions

describe('Super Admin API Tests', () => {
  let superAdminToken: string;
  let adminId: string;

  beforeAll(async () => {
    await connectDB();
    // Create a super admin user and get the token
    const superAdminResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'superadmin@example.com', password: 'superadminpassword' });
    superAdminToken = superAdminResponse.body.token;

    // Create an admin user to test adding/removing
    const adminResponse = await request(app)
      .post('/auth/signup')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Admin User', email: 'admin@example.com', password: 'adminpassword', role: 'Admin' });
    adminId = adminResponse.body.id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['superadmin@example.com', 'admin@example.com'] } });
    await disconnectDB();
  });

  describe('POST /admin/add-admin', () => {
    it('should add a new admin successfully', async () => {
      const response = await request(app)
        .post('/admin/add-admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'New Admin', email: 'newadmin@example.com', password: 'newadminpassword' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin added successfully');
    });

    it('should return an error if email is already taken', async () => {
      const response = await request(app)
        .post('/admin/add-admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ name: 'Existing Admin', email: 'admin@example.com', password: 'newadminpassword' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists');
    });

    it('should return an error if not authorized', async () => {
      const response = await request(app)
        .post('/admin/add-admin')
        .send({ name: 'Unauthorized Admin', email: 'unauthorized@example.com', password: 'unauthorizedpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('DELETE /admin/remove-admin/:id', () => {
    it('should remove an admin successfully', async () => {
      const response = await request(app)
        .delete(`/admin/remove-admin/${adminId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin removed successfully');
    });

    it('should return an error if admin does not exist', async () => {
      const response = await request(app)
        .delete('/admin/remove-admin/nonexistentid')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Admin not found');
    });

    it('should return an error if not authorized', async () => {
      const response = await request(app)
        .delete(`/admin/remove-admin/${adminId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });
});
