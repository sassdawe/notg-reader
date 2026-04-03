import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!!!!!';
  process.env.RP_ID = 'localhost';
  process.env.RP_NAME = 'notg-reader-test';
  process.env.RP_ORIGIN = 'http://localhost:3000';
});

afterAll(() => {
  // cleanup
});
