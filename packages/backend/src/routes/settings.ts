import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../utils/db.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

const updateSettingsSchema = z.object({
  viewMode: z.enum(['list', 'expanded']).optional(),
  offlineRetention: z.union([z.literal(7), z.literal(14), z.literal(30)]).optional(),
  theme: z.enum(['light', 'dark']).optional(),
});

settingsRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    let settings = await db.userSettings.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!settings) {
      settings = await db.userSettings.create({
        data: { userId: req.user!.userId },
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/', validate(updateSettingsSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const db = getDb();
    const settings = await db.userSettings.upsert({
      where: { userId: req.user!.userId },
      create: {
        userId: req.user!.userId,
        ...req.body,
      },
      update: req.body,
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
});
