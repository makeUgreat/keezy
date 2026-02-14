import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as secretService from '../services/secretService';
import { validateCreateSecret, validateUpdateSecret } from '../middleware/validation';

const router = Router();

router.post('/secrets', validateCreateSecret, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map((e) => e.msg).join(', '));
      return res.redirect('/secrets/new');
    }

    const namespace = req.session.namespace || 'default';
    await secretService.createSecret(req.k8sApi!, namespace, {
      name: req.body.name,
      type: req.body.type,
      keys: req.body.keys,
      values: req.body.values,
    });

    req.flash('success', `Secret "${req.body.name}" created successfully`);
    res.redirect(`/secrets/${encodeURIComponent(req.body.name as string)}`);
  } catch (err) {
    next(err);
  }
});

router.post('/secrets/:name', validateUpdateSecret, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.params.name as string;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map((e) => e.msg).join(', '));
      return res.redirect(`/secrets/${encodeURIComponent(name)}/edit`);
    }

    const namespace = req.session.namespace || 'default';
    await secretService.updateSecret(req.k8sApi!, namespace, name, {
      keys: req.body.keys,
      values: req.body.values,
      resourceVersion: req.body.resourceVersion,
    });

    req.flash('success', `Secret "${name}" updated successfully`);
    res.redirect(`/secrets/${encodeURIComponent(name)}`);
  } catch (err) {
    next(err);
  }
});

router.post('/secrets/:name/delete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.params.name as string;
    const namespace = req.session.namespace || 'default';
    await secretService.deleteSecret(req.k8sApi!, namespace, name);
    req.flash('success', `Secret "${name}" deleted successfully`);
    res.redirect('/secrets');
  } catch (err) {
    next(err);
  }
});

export default router;
