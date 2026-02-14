import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import { notFoundHandler, errorHandler } from '../../src/middleware/errorHandler';
import routes from '../../src/routes';

export function createTestApp(mockApi: any) {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', '..', 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser('test-secret'));
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true,
  }));
  app.use(flash());

  // Inject mock K8s API, skip CSRF for tests
  app.use((req, _res, next) => {
    (req as unknown as { k8sApi: unknown }).k8sApi = mockApi;
    next();
  });

  // Provide template locals
  app.use((req, res, next) => {
    res.locals.currentNamespace = req.session?.namespace || 'default';
    res.locals.currentContext = 'test-context';
    res.locals.contexts = ['test-context'];
    res.locals.csrfToken = 'test-token';
    res.locals.flash = {
      success: req.flash?.('success') || [],
      error: req.flash?.('error') || [],
    };
    res.locals.path = req.path;
    next();
  });

  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
