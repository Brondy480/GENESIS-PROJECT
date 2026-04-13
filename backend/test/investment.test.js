/**
 * INVESTMENT TESTS
 * These tests verify the investment request flow works correctly.
 * This is the core business logic of Genesis.
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';

let investorToken;
let creatorToken;
let projectId;

beforeAll(async () => {
  const testDbUrl = process.env.MONGO_URI_TEST || 
    'mongodb://localhost:27017/genesis_test';
  await mongoose.connect(testDbUrl);

  // Create and login a test investor
  await request(app).post('/api/v1/Auth/registration').send({
    name: 'Test Investor',
    email: 'investor@test.com',
    password: 'TestPass123!',
    userType: 'investor'
  });

  const investorLogin = await request(app)
    .post('/api/v1/Auth/login')
    .send({ email: 'investor@test.com', password: 'TestPass123!' });
  investorToken = investorLogin.body.token;

  // Create and login a test creator
  await request(app).post('/api/v1/Auth/registration').send({
    name: 'Test Creator',
    email: 'creator@test.com',
    password: 'TestPass123!',
    userType: 'creator'
  });

  const creatorLogin = await request(app)
    .post('/api/v1/Auth/login')
    .send({ email: 'creator@test.com', password: 'TestPass123!' });
  creatorToken = creatorLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Investment Request Flow', () => {

  // Test 1: Investor cannot invest without verification
  test('should reject investment from unverified investor', async () => {
    const response = await request(app)
      .post(`/api/v1/investment/projects/fake123/invest`)
      .set('Authorization', `Bearer ${investorToken}`)
      .send({
        amount: 10000,
        equityRequested: 5,
        message: 'I want to invest'
      });

    // Should fail because investor is not verified
    expect(response.status).toBe(403);
  });

  // Test 2: Investment request requires all fields
  test('should reject investment with missing equityRequested', async () => {
    const response = await request(app)
      .post(`/api/v1/investment/projects/fake123/invest`)
      .set('Authorization', `Bearer ${investorToken}`)
      .send({
        amount: 10000
        // missing equityRequested
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  // Test 3: Cannot invest without authentication
  test('should reject investment without JWT token', async () => {
    const response = await request(app)
      .post(`/api/v1/investment/projects/fake123/invest`)
      .send({
        amount: 10000,
        equityRequested: 5,
        message: 'I want to invest'
      });

    expect(response.status).toBe(401);
  });

});