/**
 * ESCROW TESTS
 * These tests verify the escrow validation and fund release logic.
 * The escrow is the most critical financial component of Genesis.
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';

let adminToken;

beforeAll(async () => {
  const testDbUrl = process.env.MONGO_URI_TEST || 
    'mongodb://localhost:27017/genesis_test';
  await mongoose.connect(testDbUrl);

  // Login as admin
  const adminLogin = await request(app)
    .post('/api/v1/Auth/login')
    .send({
      email: process.env.ADMIN_EMAIL || 'admin@genesis.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!'
    });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Escrow Management', () => {

  // Test 1: Only admin can view all escrows
  test('should allow admin to fetch all escrows', async () => {
    const response = await request(app)
      .get('/api/v1/admin/escrows')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('escrows');
  });

  // Test 2: Non-admin cannot access admin escrows
  test('should reject non-admin access to escrows', async () => {
    const response = await request(app)
      .get('/api/v1/admin/escrows');
    // No token provided

    expect(response.status).toBe(401);
  });

  // Test 3: Cannot validate non-existent escrow
  test('should return 404 for non-existent escrow validation', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .patch(`/api/v1/admin/escrows/${fakeId}/validate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  // Test 4: Cannot release non-existent escrow
  test('should return 404 for non-existent escrow release', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .patch(`/api/v1/admin/escrows/${fakeId}/release`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

});