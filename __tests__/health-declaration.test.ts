import request from 'supertest';
import setupServer from '../src/configs/server.config';
import mongoose from 'mongoose';
import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';

describe('Health Declaration API', () => {
  let app: any;

  beforeAll(async () => {
    app = await setupServer();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/health-declaration', () => {
    it('should return 200 and success response with data array', async () => {
      const res = await request(app).get('/api/health-declaration');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/health-declaration', () => {
    it('should create a new health declaration', async () => {
      const payload = {
        name: 'Test User',
        temperature: 36.6,
        symptoms: ['Cough', 'Fever'],
        contactWithInfected: false
      };
      const res = await request(app)
        .post('/api/health-declaration')
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.temperature).toBe(payload.temperature);
      expect(res.body.data.symptoms).toEqual(payload.symptoms);
      expect(res.body.data.contactWithInfected).toBe(payload.contactWithInfected);
    });

    it('should return 400 if missing required fields', async () => {
      const res = await request(app)
        .post('/api/health-declaration')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid temperature', async () => {
      const payload = {
        name: 'Test User',
        temperature: 50, // Invalid temperature
        symptoms: ['Cough'],
        contactWithInfected: false
      };
      const res = await request(app)
        .post('/api/health-declaration')
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors.some((err: string) => err.includes('Temperature'))).toBe(true);
    });

    it('should return 400 for invalid symptoms', async () => {
      const payload = {
        name: 'Test User',
        temperature: 36.5,
        symptoms: 'not an array', // Invalid symptoms
        contactWithInfected: false
      };
      const res = await request(app)
        .post('/api/health-declaration')
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body.errors.some((err: string) => err.includes('symptom'))).toBe(true);
    });

    it('should return 400 for missing name', async () => {
      const payload = {
        temperature: 36.5,
        symptoms: ['Cough'],
        contactWithInfected: false
      };
      const res = await request(app)
        .post('/api/health-declaration')
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors.some((err: string) => err.includes('Name'))).toBe(true);
    });

    it('should return 400 for missing contactWithInfected', async () => {
      const payload = {
        name: 'Test User',
        temperature: 36.5,
        symptoms: ['Cough']
      };
      const res = await request(app)
        .post('/api/health-declaration')
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.errors.some((err: string) => err.includes('Contact'))).toBe(true);
    });
  });
});
