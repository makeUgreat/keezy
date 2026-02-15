import express from 'express';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import { config, isTlsEnabled } from './config';
import { doubleCsrfProtection } from './middleware/csrf';
import { k8sClientMiddleware } from './middleware/k8sClient';
import { localsMiddleware } from './middleware/locals';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import routes from './routes';

export function createApp() {
  const app = express();

  // View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));

  // Security
  app.use(helmet({
    hsts: isTlsEnabled(config),
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }));

  // Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // Static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Body parsing
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Cookies & session
  app.use(cookieParser(config.sessionSecret));
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isTlsEnabled(config),
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }));

  // Flash messages
  app.use(flash());

  // CSRF protection
  app.use(doubleCsrfProtection);

  // K8s client injection
  app.use(k8sClientMiddleware);

  // Template locals
  app.use(localsMiddleware);

  // Routes
  app.use(routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
