import { Router, Request, Response, NextFunction } from 'express';
import * as secretService from '../services/secretService';
import { parsePagination, paginate } from '../utils/pagination';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.redirect('/secrets');
});

router.get('/secrets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const namespace = req.session.namespace || 'default';
    const all = await secretService.listSecrets(req.k8sApi!, namespace);
    const params = parsePagination(req.query as { page?: string; perPage?: string });
    const result = paginate(all, params);

    res.render('pages/secrets/list', {
      title: 'Secrets',
      secrets: result.items,
      page: result.page,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/secrets/new', (_req: Request, res: Response) => {
  res.render('pages/secrets/create', { title: 'Create Secret' });
});

router.get('/secrets/:name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const namespace = req.session.namespace || 'default';
    const name = req.params.name as string;
    const secret = await secretService.getSecret(req.k8sApi!, namespace, name);
    res.render('pages/secrets/show', { title: secret.name, secret });
  } catch (err) {
    next(err);
  }
});

router.get('/secrets/:name/edit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const namespace = req.session.namespace || 'default';
    const name = req.params.name as string;
    const secret = await secretService.getSecret(req.k8sApi!, namespace, name);
    res.render('pages/secrets/edit', { title: `Edit ${secret.name}`, secret });
  } catch (err) {
    next(err);
  }
});

export default router;
