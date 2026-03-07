import request from 'supertest';
import app from '../../app'; // Assuming your Express app is exported from this file
import { sequelize } from '../../models'; // Import your Sequelize instance
import { User } from '../../models/User'; // Import your User model

describe('GET /admin/users', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Reset the database before tests
  });

  afterEach(async () => {
    await User.destroy({ where: {} }); // Clean up the User table after each test
  });

  it('should return all users filtered by role', async () => {
    // Create test users
    await User.bulkCreate([
      { name: 'Doctor A', email: 'doctorA@example.com', password: 'password', role: 'Doctor', status: 'Approved' },
      { name: 'Patient A', email: 'patientA@example.com', password: 'password', role: 'Patient', status: 'Approved' },
      { name: 'Admin A', email: 'adminA@example.com', password: 'password', role: 'Admin', status: 'Approved' },
    ]);

    const response = await request(app)
      .get('/admin/users?role=Doctor')
      .set('Authorization', `Bearer ${yourValidToken}`); // Replace with a valid token

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0]).toHaveProperty('name', 'Doctor A');
  });

  it('should return an empty array if no users match the role', async () => {
    const response = await request(app)
      .get('/admin/users?role=Doctor')
      .set('Authorization', `Bearer ${yourValidToken}`); // Replace with a valid token

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users).toHaveLength(0);
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/admin/users?role=Doctor');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should return 403 if user is not an Admin', async () => {
    const response = await request(app)
      .get('/admin/users?role=Doctor')
      .set('Authorization', `Bearer ${yourNonAdminToken}`); // Replace with a valid non-admin token

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Forbidden');
  });
});
