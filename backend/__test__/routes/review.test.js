import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../src/app.js';
import { User, Product, Review, Order,Measurement } from '../../src/models/index.js';
import { DB_NAME } from '../../src/constants.js';

describe('Review Routes', () => {
  let userToken;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

      // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'user@example.com',
    password: 'testPass123'
  });

  // Create test product
  testProduct = await Product.create({
    name: 'Test Shirt',
    price: 49,
    fabricType: 'cotton',
    category: 'shirt',
    stock: 10 // Add stock quantity
  });

  // Create VALID measurement
  const measurement = await Measurement.create({
    user: user._id,
    chest: 40,
    waist: 32,
    height: 180
  });

  // Create delivered order with ALL required fields
  await Order.create({
    user: measurement.user,
    measurements: measurement._id,
    product: testProduct._id,
    totalAmount: 99,
    status: 'delivered',
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

  // Add this check after order creation
const createdOrder = await Order.findOne({ status: "delivered" });
if (!createdOrder) {
  throw new Error("Test order creation failed - check required fields");
}

// Verify product ID type
console.log("Order product ID type:", typeof createdOrder.product); // Should be 'object'
    // Get user token
    const login = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'user@example.com', password: 'testPass123' });
    userToken = login.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/reviews/product/:productId', () => {
    it('should create a new review', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/product/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Great product!' });

      expect(response.statusCode).toBe(201);
      expect(response.body.data.rating).toBe(5);
    });

    it('should prevent duplicate reviews', async () => {
      await Review.create({
        user: (await User.findOne({ email: 'user@example.com' }))._id,
        product: testProduct._id,
        rating: 4
      });

      const response = await request(app)
        .post(`/api/v1/reviews/product/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5 });

      expect(response.statusCode).toBe(400);
    });
  });
});