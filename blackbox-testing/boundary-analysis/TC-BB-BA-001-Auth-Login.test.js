/**
 * TC-BB-BA-001: Boundary Analysis Test - Authentication Login
 * 
 * This test verifies boundary conditions for login functionality:
 * - Minimum/Maximum email length
 * - Minimum/Maximum password length
 * - Valid/Invalid email formats at boundaries
 * - Empty, null, and undefined inputs
 * 
 * Testing Module: Authentication Controller (Login)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../../server/routes/auth.js';
import User from '../../server/models/User.js';
import bcrypt from 'bcryptjs';

describe('TC-BB-BA-001: Boundary Analysis - Login Email/Password Length', () => {
  let mongoServer;
  let app;
  let validUser;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create valid test user
    const hashedPassword = await bcrypt.hash('ValidPass123!', 10);
    validUser = await User.create({
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      isEmailVerified: true
    });
  });

  // ==================== EMAIL BOUNDARY TESTS ====================

  it('BA-001.1: Should reject login with empty email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: '',
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('required');
  });

  it('BA-001.2: Should reject login with email length = 1 character', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'a',
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.3: Should accept login with valid minimum length email (a@b.co = 6 chars)', async () => {
    // Create user with minimum length email
    const minEmail = 'a@b.co';
    await User.create({
      fullName: 'Min User',
      username: 'minuser',
      email: minEmail,
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: minEmail,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(minEmail);
  });

  it('BA-001.4: Should accept login with email at standard length (50 chars)', async () => {
    const standardEmail = 'a'.repeat(40) + '@test.com'; // 50 chars
    await User.create({
      fullName: 'Standard User',
      username: 'standarduser',
      email: standardEmail,
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: standardEmail,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.5: Should handle email at maximum typical length (254 chars)', async () => {
    const maxEmail = 'a'.repeat(240) + '@example.com'; // ~254 chars
    await User.create({
      fullName: 'Max User',
      username: 'maxuser',
      email: maxEmail,
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: maxEmail,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.6: Should reject email with excessive length (>255 chars)', async () => {
    const excessiveEmail = 'a'.repeat(260) + '@example.com';
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: excessiveEmail,
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  // ==================== PASSWORD BOUNDARY TESTS ====================

  it('BA-001.7: Should reject login with empty password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com',
        password: ''
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('required');
  });

  it('BA-001.8: Should reject password with length = 1 character', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com',
        password: 'a'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.9: Should accept password at minimum length boundary (8 chars)', async () => {
    // Create user with 8 char password
    const minPass = 'Pass123!';
    await User.create({
      fullName: 'Min Pass User',
      username: 'minpassuser',
      email: 'minpass@test.com',
      password: await bcrypt.hash(minPass, 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'minpass@test.com',
        password: minPass
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.10: Should reject password below minimum (7 chars)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com',
        password: 'Pass12!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.11: Should accept password at standard length (16 chars)', async () => {
    const standardPass = 'StandardPass123!';
    await User.create({
      fullName: 'Standard Pass User',
      username: 'stdpassuser',
      email: 'stdpass@test.com',
      password: await bcrypt.hash(standardPass, 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'stdpass@test.com',
        password: standardPass
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.12: Should accept password at maximum reasonable length (128 chars)', async () => {
    const maxPass = 'P@ss1' + 'a'.repeat(123); // 128 chars
    await User.create({
      fullName: 'Max Pass User',
      username: 'maxpassuser',
      email: 'maxpass@test.com',
      password: await bcrypt.hash(maxPass, 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'maxpass@test.com',
        password: maxPass
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  // ==================== NULL/UNDEFINED BOUNDARY TESTS ====================

  it('BA-001.13: Should reject login with null email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: null,
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.14: Should reject login with undefined email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.15: Should reject login with null password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com',
        password: null
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.16: Should reject login with undefined password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  // ==================== USERNAME BOUNDARY TESTS ====================

  it('BA-001.17: Should accept login with username at minimum length (3 chars)', async () => {
    const minUsername = 'abc';
    await User.create({
      fullName: 'Min Username User',
      username: minUsername,
      email: 'minun@test.com',
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: minUsername,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.username).toBe(minUsername);
  });

  it('BA-001.18: Should reject login with username below minimum (2 chars)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'ab',
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.19: Should accept login with username at maximum length (30 chars)', async () => {
    const maxUsername = 'a'.repeat(30);
    await User.create({
      fullName: 'Max Username User',
      username: maxUsername,
      email: 'maxun@test.com',
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: maxUsername,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.20: Should reject login with username exceeding maximum (31 chars)', async () => {
    const excessiveUsername = 'a'.repeat(31);
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: excessiveUsername,
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  // ==================== SPECIAL CHARACTERS BOUNDARY ====================

  it('BA-001.21: Should handle email with special chars at boundary', async () => {
    const specialEmail = 'test+user@sub-domain.example.co.uk';
    await User.create({
      fullName: 'Special Email User',
      username: 'specialuser',
      email: specialEmail,
      password: await bcrypt.hash('ValidPass123!', 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: specialEmail,
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.22: Should handle password with all allowed special characters', async () => {
    const specialPass = 'Pass123!@#$%^&*()';
    await User.create({
      fullName: 'Special Pass User',
      username: 'specialpassuser',
      email: 'specialpass@test.com',
      password: await bcrypt.hash(specialPass, 10),
      isEmailVerified: true
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'specialpass@test.com',
        password: specialPass
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  // ==================== WHITESPACE BOUNDARY ====================

  it('BA-001.23: Should trim whitespace from email boundaries', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: '  test@example.com  ',
        password: 'ValidPass123!'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('BA-001.24: Should reject email with only whitespace', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: '     ',
        password: 'ValidPass123!'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('BA-001.25: Should reject password with only whitespace', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: 'test@example.com',
        password: '        '
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
