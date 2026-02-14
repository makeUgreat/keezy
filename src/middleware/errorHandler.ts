import { Request, Response, NextFunction } from 'express';
import { K8sApiError, ValidationError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).render('pages/error', {
    title: 'Not Found',
    statusCode: 404,
    message: `Page not found: ${req.originalUrl}`,
  });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof K8sApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
  } else {
    console.error('Unhandled error:', err);
    message = err.message || message;
  }

  if (req.path.startsWith('/api/')) {
    res.status(statusCode).json({ error: message });
    return;
  }

  res.status(statusCode).render('pages/error', {
    title: `Error ${statusCode}`,
    statusCode,
    message,
  });
}
