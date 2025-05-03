import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { User } from '../../src/models/user.model.js';
import { Tailor } from '../../src/models/tailor.model.js';
import { DB_NAME } from '../../src/constants.js';

describe('Tailor Routes', () => {
  let adminToken;
  let customerToken;
  let testUser;
  let testTailor;

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Tailor.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminPass123',
      role: 'admin'
    });

    // Create regular user
    testUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'userPass123',
      role: 'customer'
    });

    // Create existing tailor
    testTailor = await Tailor.create({
      user: testUser._id,
      specialization: ['suits'],
      availability: true
    });

    // Get admin token
    const adminLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'admin@example.com', password: 'adminPass123' });
    adminToken = adminLogin.body.data.accessToken;

    // Get customer token
    const userLogin = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'user@example.com', password: 'userPass123' });
    customerToken = userLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/tailors', () => {
    it('should create a new tailor (admin)', async () => {
      const newUser = await User.create({
        name: 'New Tailor User',
        email: 'newtailor@example.com',
        password: 'newTailorPass123',
        role: 'customer'
      });

      const response = await request(app)
        .post('/api/v1/tailors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: newUser._id,
          specialization: ['dresses']
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.specialization).toContain('dresses');
    });

    it('should prevent duplicate tailor registration', async () => {
      const response = await request(app)
        .post('/api/v1/tailors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUser._id,
          specialization: ['suits']
        });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('GET /api/v1/tailors', () => {
    it('should list all tailors', async () => {
      const response = await request(app)
        .get('/api/v1/tailors')
        .query({ page: 1, limit: 10 });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.docs.length).toBe(1);
    });
  });

  describe('PATCH /api/v1/tailors/:tailorId', () => {
    it('should update tailor details (admin)', async () => {
      const response = await request(app)
        .patch(`/api/v1/tailors/${testTailor._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ availability: false });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.availability).toBe(false);
    });
  });
});