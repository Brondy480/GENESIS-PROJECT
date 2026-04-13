/**
 * AUTH TESTS
 * These tests verify that user registration and login work correctly.
 * We test both success cases and failure cases.
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';

// Before all tests, connect to a test database
beforeAll(async () => {
  const testDbUrl = process.env.MONGO_URI_TEST || 
    'mongodb://localhost:27017/genesis_test';
  await mongoose.connect(testDbUrl);
});

// After all tests, clean up and disconnect
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Authentication', () => {

  // Test 1: Successful registration
  test('should register a new creator successfully', async () => {
    const response = await request(app)
      .post('/api/v1/Auth/registration')
      .send({
        name: 'Test Creator',
        email: 'testcreator@genesis.com',
        password: 'TestPass123!',
        userType: 'creator'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('testcreator@genesis.com');
    expect(response.body.user.userType).toBe('creator');
  });

  // Test 2: Duplicate email should fail
  test('should reject registration with duplicate email', async () => {
    // Try to register same email again
    const response = await request(app)
      .post('/api/v1/Auth/registration')
      .send({
        name: 'Another Creator',
        email: 'testcreator@genesis.com',
        password: 'TestPass123!',
        userType: 'creator'
      });

    expect(response.status).toBe(400);
  });

  // Test 3: Successful login
  test('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/v1/Auth/login')
      .send({
        email: 'testcreator@genesis.com',
        password: 'TestPass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  // Test 4: Wrong password should fail
  test('should reject login with wrong password', async () => {
    const response = await request(app)
      .post('/api/v1/Auth/login')
      .send({
        email: 'testcreator@genesis.com',
        password: 'WrongPassword!'
      });

    expect(response.status).toBe(401);
  });

  // Test 5: Missing required fields
  test('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/Auth/registration')
      .send({
        email: 'incomplete@genesis.com'
        // missing name, password, userType
      });

    expect(response.status).toBe(400);
  });

});