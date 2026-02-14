import { Router } from 'express';
import pages from './pages';
import secrets from './secrets';
import namespaces from './namespaces';
import contexts from './contexts';

const router = Router();

router.use(pages);
router.use(secrets);
router.use(namespaces);
router.use(contexts);

export default router;
