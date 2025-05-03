import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { User, Measurement, Order } from '../../src/models/index.js';
import { DB_NAME } from '../../src/constants.js';

describe('Measurement Routes', () => {
  let userToken;

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Measurement.deleteMany({});

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: 'testPass123'
    });

    // Get user token
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'user@example.com', password: 'testPass123' });
    userToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/measurements', () => {
    it('should create new measurement', async () => {
      const response = await request(app)
        .post('/api/v1/measurements')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          chest: 40,
          waist: 32,
          height: 180
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.chest).toBe(40);
    });
  });

  describe('DELETE /api/v1/measurements/:measurementId', () => {
    it('should prevent deletion if used in orders', async () => {
      // Create measurement
      const measurement = await Measurement.create({
          user: (await User.findOne({ email: 'user@example.com' }))._id,
          chest: 40,
          waist: 32,
          height: 180
      });
  
      // Verify measurement creation
      if (!measurement) {
          throw new Error("Measurement creation failed in test setup");
      }
  
      // Create order with explicit measurement reference
      const order = await Order.create({
          user: measurement.user,
          measurements: measurement._id, // Direct ObjectId reference
          product: new mongoose.Types.ObjectId(),
          totalAmount: 99.99,
          status: 'placed',
          deliveryAddress: {
              street: "123 Test St",
              city: "Test City",
              state: "Test State",
              zipCode: "12345",
              type: "home"
          },
          designChoices: {
              collar: "classic",
              sleeves: "long"
          }
      });
  
      // Verify order creation
      if (!order) {
          throw new Error("Order creation failed in test setup");
      }
  
      const response = await request(app)
          .delete(`/api/v1/measurements/${measurement._id}`)
          .set('Authorization', `Bearer ${userToken}`);
  
      expect(response.statusCode).toBe(400);
  });
  });
});