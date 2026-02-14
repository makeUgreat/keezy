import { Request, Response, NextFunction } from 'express';
import { makeApiClient, setCurrentContext, getCurrentContext } from '../config/k8s';
import { config } from '../config';

export function k8sClientMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const sessionContext = req.session?.context;
  if (sessionContext && sessionContext !== getCurrentContext()) {
    setCurrentContext(sessionContext);
  }

  if (!req.session.namespace) {
    req.session.namespace = config.k8sNamespace;
  }

  req.k8sApi = makeApiClient();
  next();
}
