import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as contextService from '../services/contextService';
import { validateContextSwitch } from '../middleware/validation';

const router = Router();

router.post('/context/switch', validateContextSwitch, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', 'Invalid context');
    return res.redirect('/secrets');
  }

  try {
    contextService.switchContext(req.body.context);
    req.session.context = req.body.context;
    req.session.namespace = 'default';
    req.flash('success', `Switched to context "${req.body.context}"`);
  } catch (err) {
    req.flash('error', (err as Error).message);
  }

  res.redirect('/secrets');
});

export default router;
