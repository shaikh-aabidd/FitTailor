import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { Product,User } from '../../src/models/index.js';
import { DB_NAME } from '../../src/constants.js';

describe('Product Routes', () => {
  let adminToken;

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    // Create admin user and get token (similar to previous examples)
    const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminPass123',
        role: 'admin'
      });
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({ email: 'admin@example.com', password: 'adminPass123' });
      adminToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/products', () => {
    it('should create new product (admin)', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Suit',
          price: 199.99,
          fabricType: 'wool',
          category: 'suit'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.category).toBe('suit');
    });
  });

  describe('GET /api/v1/products', () => {
    it('should list products with filters', async () => {
      await Product.create([
        { name: 'Shirt 1', price: 29.99, fabricType: 'cotton', category: 'shirt' },
        { name: 'Shirt 2', price: 39.99, fabricType: 'linen', category: 'shirt' }
      ]);

      const response = await request(app)
        .get('/api/v1/products')
        .query({ category: 'shirt', fabricType: 'cotton' });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.docs.length).toBe(1);
    });
  });
});