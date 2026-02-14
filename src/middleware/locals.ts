import { Request, Response, NextFunction } from 'express';
import { getCurrentContext, getContexts } from '../config/k8s';
import { generateToken } from './csrf';

export function localsMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.locals.currentNamespace = req.session?.namespace || 'default';
  res.locals.currentContext = getCurrentContext();
  res.locals.contexts = getContexts().map((c) => c.name);
  res.locals.csrfToken = generateToken(req, res);
  res.locals.flash = {
    success: req.flash?.('success') || [],
    error: req.flash?.('error') || [],
  };
  res.locals.path = req.path;
  next();
}
