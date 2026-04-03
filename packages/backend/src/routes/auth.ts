import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const authRouter = Router();

const usernameSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
});

const profileSchema = z.object({
  displayName: z.string().max(100).optional(),
  email: z.string().email().optional(),
});

authRouter.post('/register/start', validate(usernameSchema), async (req, res, next) => {
  try {
    const result = await authService.startRegistration(req.body.username);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register/finish', async (req, res, next) => {
  try {
    const { userId, response } = req.body;
    const result = await authService.finishRegistration(userId, response);
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.json({ verified: result.verified });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login/start', validate(usernameSchema), async (req, res, next) => {
  try {
    const result = await authService.startAuthentication(req.body.username);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login/finish', async (req, res, next) => {
  try {
    const { userId, response } = req.body;
    const result = await authService.finishAuthentication(userId, response);
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    res.json({ verified: result.verified });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { getDb } = await import('../utils/db.js');
    const db = getDb();
    const user = await db.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

authRouter.put('/profile', requireAuth, validate(profileSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
