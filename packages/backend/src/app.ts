import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { feedRouter } from './routes/feeds.js';
import { itemRouter } from './routes/items.js';
import { labelRouter } from './routes/labels.js';
import { opmlRouter } from './routes/opml.js';
import { searchRouter } from './routes/search.js';
import { settingsRouter } from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.RP_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(csrfProtection);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/feeds', feedRouter);
  app.use('/api/items', itemRouter);
  app.use('/api/labels', labelRouter);
  app.use('/api/opml', opmlRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/settings', settingsRouter);

  // Error handler
  app.use(errorHandler);

  return app;
}
