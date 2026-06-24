import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
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
  const frontendDistPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

  // Security middleware
  app.use(helmet());

  const codespacesOrigin = process.env.CODESPACE_NAME
    ? `https://${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'}`
    : undefined;

  app.use(cors({
    origin: process.env.RP_ORIGIN || codespacesOrigin || 'http://localhost:3000',
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

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(frontendDistPath));
    app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

  // Error handler
  app.use(errorHandler);

  return app;
}
