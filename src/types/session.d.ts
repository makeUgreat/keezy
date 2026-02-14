import 'express-session';

declare module 'express-session' {
  interface SessionData {
    namespace?: string;
    context?: string;
  }
}
