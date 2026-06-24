import express from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToken } from '../utils/jwt.js';

vi.mock('../utils/db.js', () => ({
  getDb: vi.fn(),
}));

import { getDb } from '../utils/db.js';
import { labelRouter } from './labels.js';

describe('labelRouter POST /assign', () => {
  const app = express();
  app.use(express.json());
  app.use('/labels', labelRouter);

  const mockDb = {
    label: {
      findFirst: vi.fn(),
    },
    userItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userItemLabel: {
      create: vi.fn(),
    },
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDb).mockReturnValue(mockDb as never);
  });

  it('returns 404 when label does not belong to current user', async () => {
    const token = await createToken({ userId: 'user-1', username: 'user1' });
    mockDb.label.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post('/labels/assign')
      .set('Authorization', 'Bearer ' + token)
      .send({ feedItemId: 'feed-item-1', labelId: 'label-foreign' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Label not found or not accessible' });
    expect(mockDb.userItem.findUnique).not.toHaveBeenCalled();
    expect(mockDb.userItemLabel.create).not.toHaveBeenCalled();
  });

  it('assigns label when it belongs to current user', async () => {
    const token = await createToken({ userId: 'user-1', username: 'user1' });
    mockDb.label.findFirst.mockResolvedValue({ id: 'label-1', userId: 'user-1' });
    mockDb.userItem.findUnique.mockResolvedValue({ id: 'user-item-1' });
    mockDb.userItemLabel.create.mockResolvedValue({ id: 'user-item-label-1' });

    const response = await request(app)
      .post('/labels/assign')
      .set('Authorization', 'Bearer ' + token)
      .send({ feedItemId: 'feed-item-1', labelId: 'label-1' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ success: true });
    expect(mockDb.userItemLabel.create).toHaveBeenCalledWith({
      data: { userItemId: 'user-item-1', labelId: 'label-1' },
    });
  });
});
