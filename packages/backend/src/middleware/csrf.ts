import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection via custom header requirement.
 * State-changing requests must include X-Requested-With header.
 * Browsers won't send custom headers in cross-origin requests without CORS preflight approval.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const hasCustomHeader = req.headers['x-requested-with'];
  if (!hasCustomHeader) {
    res.status(403).json({ error: 'Missing X-Requested-With header' });
    return;
  }

  next();
}
