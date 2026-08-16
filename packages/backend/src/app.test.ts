import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import type { Express } from 'express';

let app: Express;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!!!!!';
  process.env.RP_ID = 'localhost';
  process.env.RP_NAME = 'notg-reader-test';
  process.env.RP_ORIGIN = 'http://localhost:3000';
  app = createApp();
});

describe('App', () => {
  it('should respond to health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return 401 for protected routes without auth', async () => {
    const response = await request(app).get('/api/feeds');
    expect(response.status).toBe(401);
  });

  it('should return 401 for items without auth', async () => {
    const response = await request(app).get('/api/items');
    expect(response.status).toBe(401);
  });

  it('should return 401 for labels without auth', async () => {
    const response = await request(app).get('/api/labels');
    expect(response.status).toBe(401);
  });

  it('should return 401 for settings without auth', async () => {
    const response = await request(app).get('/api/settings');
    expect(response.status).toBe(401);
  });

  it('should return 401 for search without auth', async () => {
    const response = await request(app).get('/api/search');
    expect(response.status).toBe(401);
  });

  it('should return 401 for opml export without auth', async () => {
    const response = await request(app).get('/api/opml/export');
    expect(response.status).toBe(401);
  });

  it('should set security headers', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('should validate registration input', async () => {
    const response = await request(app)
      .post('/api/auth/register/start')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ username: 'ab' }); // too short
    expect(response.status).toBe(400);
  });

  it('should validate registration username format', async () => {
    const response = await request(app)
      .post('/api/auth/register/start')
      .set('X-Requested-With', 'XMLHttpRequest')
      .send({ username: 'invalid user name!' });
    expect(response.status).toBe(400);
  });

  it('should handle logout', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('X-Requested-With', 'XMLHttpRequest');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
