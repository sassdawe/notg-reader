import { Router } from 'express';
import * as opmlService from '../services/opmlService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

export const opmlRouter = Router();

opmlRouter.use(requireAuth);

opmlRouter.get('/export', async (req: AuthenticatedRequest, res, next) => {
  try {
    const opml = await opmlService.exportOpml(req.user!.userId);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="subscriptions.opml"');
    res.send(opml);
  } catch (error) {
    next(error);
  }
});

opmlRouter.post('/import', async (req: AuthenticatedRequest, res, next) => {
  try {
    const opmlContent = req.body.opml;
    if (!opmlContent || typeof opmlContent !== 'string') {
      res.status(400).json({ error: 'OPML content is required' });
      return;
    }
    const result = await opmlService.importOpml(req.user!.userId, opmlContent);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
