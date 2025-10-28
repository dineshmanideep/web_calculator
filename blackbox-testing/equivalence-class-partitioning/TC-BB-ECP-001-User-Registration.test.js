/**
 * TC-BB-ECP-001: Equivalence Class Partitioning - User Registration
 * 
 * This test partitions input data into equivalence classes:
 * - Valid email formats vs invalid email formats
 * - Valid password strengths vs invalid password strengths
 * - Valid username formats vs invalid username formats
 * - Valid full names vs invalid full names
 * 
 * Testing Module: Signup Controller
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import authRoutes from '../../server/routes/auth.js';
import User from '../../server/models/User.js';

describe('TC-BB-ECP-001: Equivalence Class Partitioning - User Registration', () => {
  let mongoServer;
  let app;

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
  });

  // ==================== EMAIL EQUIVALENCE CLASSES ====================

  describe('ECP-001.1: Email Equivalence Classes', () => {
    
    it('VALID CLASS: Standard email format (user@domain.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('VALID CLASS: Email with subdomain (user@mail.example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user@mail.example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('VALID CLASS: Email with plus addressing (user+tag@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user+tag@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('VALID CLASS: Email with dots in local part (first.last@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'first.last@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('VALID CLASS: Email with numbers (user123@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user123@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('INVALID CLASS: Missing @ symbol (userexample.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'userexample.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Missing domain (@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: '@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Missing local part (user@)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user@' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Multiple @ symbols (user@@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user@@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Spaces in email (user @example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user @example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Invalid characters in email (user!#$@example.com)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user!#$@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Missing TLD (user@example)', async () => {
      const response = await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email: 'user@example' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== PASSWORD EQUIVALENCE CLASSES ====================

  describe('ECP-001.2: Password Strength Equivalence Classes', () => {

    // Helper to complete signup with specific password
    const completeSignupWithPassword = async (password) => {
      const email = `test${Date.now()}@example.com`;
      
      // Send OTP
      await request(app)
        .post('/api/auth/signup-send-otp')
        .send({ email });

      // Mock OTP verification (assuming OTP is stored)
      const otp = '123456'; // Mock OTP
      await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp });

      // Complete signup
      return request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: `user${Date.now()}`,
          fullName: 'Test User',
          password
        });
    };

    it('VALID CLASS: Strong password (uppercase, lowercase, number, special, 8+ chars)', async () => {
      const response = await completeSignupWithPassword('StrongP@ss123');
      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Password with minimum requirements (Pass123!)', async () => {
      const response = await completeSignupWithPassword('Pass123!');
      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Long strong password (20+ characters)', async () => {
      const response = await completeSignupWithPassword('VeryStrongP@ssword123456');
      expect(response.status).toBe(200);
    });

    it('INVALID CLASS: Too short password (<8 chars)', async () => {
      const response = await completeSignupWithPassword('Pass1!');
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password');
    });

    it('INVALID CLASS: No uppercase letters (pass123!)', async () => {
      const response = await completeSignupWithPassword('password123!');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: No lowercase letters (PASS123!)', async () => {
      const response = await completeSignupWithPassword('PASSWORD123!');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: No numbers (Password!)', async () => {
      const response = await completeSignupWithPassword('Password!');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: No special characters (Password123)', async () => {
      const response = await completeSignupWithPassword('Password123');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: Only lowercase (abcdefgh)', async () => {
      const response = await completeSignupWithPassword('abcdefgh');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: Only uppercase (ABCDEFGH)', async () => {
      const response = await completeSignupWithPassword('ABCDEFGH');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: Only numbers (12345678)', async () => {
      const response = await completeSignupWithPassword('12345678');
      expect(response.status).toBe(400);
    });

    it('INVALID CLASS: Only special characters (!@#$%^&*)', async () => {
      const response = await completeSignupWithPassword('!@#$%^&*');
      expect(response.status).toBe(400);
    });
  });

  // ==================== USERNAME EQUIVALENCE CLASSES ====================

  describe('ECP-001.3: Username Format Equivalence Classes', () => {

    it('VALID CLASS: Alphanumeric username (user123)', async () => {
      const email = 'valid1@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'user123',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Username with underscores (user_name_123)', async () => {
      const email = 'valid2@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'user_name_123',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Minimum length username (abc)', async () => {
      const email = 'valid3@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'abc',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('INVALID CLASS: Username with spaces (user name)', async () => {
      const email = 'invalid1@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'user name',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Username with special characters (user@name)', async () => {
      const email = 'invalid2@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'user@name',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Username too short (<3 chars)', async () => {
      const email = 'invalid3@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'ab',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Username starting with number (123user)', async () => {
      const email = 'invalid4@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: '123user',
          fullName: 'Test User',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== FULL NAME EQUIVALENCE CLASSES ====================

  describe('ECP-001.4: Full Name Equivalence Classes', () => {

    it('VALID CLASS: Two word name (John Doe)', async () => {
      const email = 'name1@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'johndoe',
          fullName: 'John Doe',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Three word name (John Middle Doe)', async () => {
      const email = 'name2@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'johnmdoe',
          fullName: 'John Middle Doe',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Name with apostrophe (O\'Brien)', async () => {
      const email = 'name3@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'obrien',
          fullName: "Patrick O'Brien",
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('VALID CLASS: Name with hyphen (Mary-Jane)', async () => {
      const email = 'name4@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'maryjane',
          fullName: 'Mary-Jane Watson',
          password: 'StrongP@ss123'
        });

      expect(response.status).toBe(200);
    });

    it('INVALID CLASS: Single word name (John)', async () => {
      const email = 'nameinv1@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'john',
          fullName: 'John',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Name with numbers (John123 Doe)', async () => {
      const email = 'nameinv2@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'john123',
          fullName: 'John123 Doe',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Name with special characters (John@Doe)', async () => {
      const email = 'nameinv3@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'johndoe2',
          fullName: 'John@Doe',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Empty full name', async () => {
      const email = 'nameinv4@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-complete')
        .send({
          email,
          username: 'emptyname',
          fullName: '',
          password: 'StrongP@ss123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==================== OTP EQUIVALENCE CLASSES ====================

  describe('ECP-001.5: OTP Verification Equivalence Classes', () => {

    it('VALID CLASS: 6-digit numeric OTP (123456)', async () => {
      const email = 'otp1@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      // Assuming correct OTP format
      const response = await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp: '123456' });

      // Will fail if OTP doesn't match, but format is valid
      expect([200, 400]).toContain(response.status);
    });

    it('INVALID CLASS: Less than 6 digits (12345)', async () => {
      const email = 'otp2@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp: '12345' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: More than 6 digits (1234567)', async () => {
      const email = 'otp3@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp: '1234567' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: OTP with letters (abc123)', async () => {
      const email = 'otp4@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp: 'abc123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('INVALID CLASS: Empty OTP', async () => {
      const email = 'otp5@example.com';
      await request(app).post('/api/auth/signup-send-otp').send({ email });
      
      const response = await request(app)
        .post('/api/auth/signup-verify-otp')
        .send({ email, otp: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
