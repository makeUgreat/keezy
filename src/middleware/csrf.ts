import { doubleCsrf } from 'csrf-csrf';
import { config, isTlsEnabled } from '../config';

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => config.sessionSecret,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: isTlsEnabled(config),
  },
  getTokenFromRequest: (req) => req.body?._csrf || req.headers['x-csrf-token'],
});

export { doubleCsrfProtection, generateToken };
