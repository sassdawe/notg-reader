import { Router } from 'express';
import { z } from 'zod';
import * as feedService from '../services/feedService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const feedRouter = Router();

feedRouter.use(requireAuth);

const subscribeSchema = z.object({
  url: z.string().url(),
  title: z.string().max(200).optional(),
});

feedRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const feeds = await feedService.getUserFeeds(req.user!.userId);
    res.json(feeds);
  } catch (error) {
    next(error);
  }
});

feedRouter.post('/subscribe', validate(subscribeSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const subscription = await feedService.subscribeFeed(
      req.user!.userId,
      req.body.url,
      req.body.title,
    );
    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
});

feedRouter.delete('/:subscriptionId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const subscriptionId = Array.isArray(req.params.subscriptionId)
      ? req.params.subscriptionId[0] : req.params.subscriptionId;
    await feedService.unsubscribeFeed(req.user!.userId, subscriptionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

feedRouter.post('/:feedId/refresh', async (req: AuthenticatedRequest, res, next) => {
  try {
    const feedId = Array.isArray(req.params.feedId) ? req.params.feedId[0] : req.params.feedId;
    await feedService.refreshFeed(feedId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

feedRouter.get('/search', async (req: AuthenticatedRequest, res, next) => {
  try {
    const query = String(req.query.q || '');
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    const feeds = await feedService.searchFeeds(query);
    res.json(feeds);
  } catch (error) {
    next(error);
  }
});
