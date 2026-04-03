import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../utils/db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const labelRouter = Router();

labelRouter.use(requireAuth);

const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const assignLabelSchema = z.object({
  feedItemId: z.string(),
  labelId: z.string(),
});

labelRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    const labels = await db.label.findMany({
      where: { userId: req.user!.userId },
      orderBy: { name: 'asc' },
    });
    res.json(labels);
  } catch (error) {
    next(error);
  }
});

labelRouter.post('/', validate(createLabelSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    const label = await db.label.create({
      data: {
        userId: req.user!.userId,
        name: req.body.name,
        color: req.body.color,
      },
    });
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
});

labelRouter.delete('/:labelId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    await db.label.delete({
      where: { id: Array.isArray(req.params.labelId) ? req.params.labelId[0] : req.params.labelId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

labelRouter.post('/assign', validate(assignLabelSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    const { feedItemId, labelId } = req.body;

    // Ensure user item exists
    let userItem = await db.userItem.findUnique({
      where: { userId_feedItemId: { userId: req.user!.userId, feedItemId } },
    });

    if (!userItem) {
      userItem = await db.userItem.create({
        data: { userId: req.user!.userId, feedItemId },
      });
    }

    await db.userItemLabel.create({
      data: { userItemId: userItem.id, labelId },
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

labelRouter.post('/unassign', validate(assignLabelSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    const { feedItemId, labelId } = req.body;

    const userItem = await db.userItem.findUnique({
      where: { userId_feedItemId: { userId: req.user!.userId, feedItemId } },
    });

    if (userItem) {
      await db.userItemLabel.deleteMany({
        where: { userItemId: userItem.id, labelId },
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});
