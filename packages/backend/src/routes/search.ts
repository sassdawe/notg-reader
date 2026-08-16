import { Router } from 'express';
import * as itemService from '../services/itemService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const searchRouter = Router();

searchRouter.use(requireAuth);

searchRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const query = String(req.query.q || '');
    if (!query) {
      res.status(400).json({ error: 'Query parameter q is required' });
      return;
    }
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 100);
    const items = await itemService.searchItems(req.user!.userId, query, page, limit);
    res.json(items);
  } catch (error) {
    next(error);
  }
});
