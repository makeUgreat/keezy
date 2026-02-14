import { doubleCsrf } from 'csrf-csrf';
import { config } from '../config';

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => config.sessionSecret,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.nodeEnv === 'production',
  },
  getTokenFromRequest: (req) => req.body?._csrf || req.headers['x-csrf-token'],
});

export { doubleCsrfProtection, generateToken };
