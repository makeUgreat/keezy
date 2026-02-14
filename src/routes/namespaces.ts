import { Router, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as namespaceService from '../services/namespaceService';
import { validateNamespaceSwitch } from '../middleware/validation';

const router = Router();

router.post('/namespace/switch', validateNamespaceSwitch, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Invalid namespace');
    return res.redirect('/secrets');
  }

  req.session.namespace = req.body.namespace;
  req.flash('success', `Switched to namespace "${req.body.namespace}"`);
  res.redirect('/secrets');
});

router.get('/api/namespaces', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const namespaces = await namespaceService.listNamespaces(req.k8sApi!);
    res.json({ namespaces });
  } catch (err) {
    next(err);
  }
});

export default router;
