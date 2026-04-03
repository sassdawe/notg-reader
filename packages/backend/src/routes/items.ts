import { Router } from 'express';
import { z } from 'zod';
import * as itemService from '../services/itemService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const itemRouter = Router();

itemRouter.use(requireAuth);

itemRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const result = await itemService.getUserItems(req.user!.userId, {
      feedId: req.query.feedId as string | undefined,
      isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
      isStarred: req.query.isStarred !== undefined ? req.query.isStarred === 'true' : undefined,
      labelId: req.query.labelId as string | undefined,
      page: parseInt(String(req.query.page || '1'), 10),
      limit: Math.min(parseInt(String(req.query.limit || '50'), 10), 100),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const markReadSchema = z.object({
  feedItemIds: z.array(z.string()).min(1).max(100),
});

itemRouter.post('/read', validate(markReadSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    await itemService.markItemsRead(req.user!.userId, req.body.feedItemIds);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

itemRouter.post('/:feedItemId/read', async (req: AuthenticatedRequest, res, next) => {
  try {
    const feedItemId = Array.isArray(req.params.feedItemId) ? req.params.feedItemId[0] : req.params.feedItemId;
    await itemService.markItemRead(req.user!.userId, feedItemId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

itemRouter.post('/:feedItemId/star', async (req: AuthenticatedRequest, res, next) => {
  try {
    const feedItemId = Array.isArray(req.params.feedItemId) ? req.params.feedItemId[0] : req.params.feedItemId;
    const result = await itemService.toggleStarItem(req.user!.userId, feedItemId);
    res.json({ isStarred: result.isStarred });
  } catch (error) {
    next(error);
  }
});
