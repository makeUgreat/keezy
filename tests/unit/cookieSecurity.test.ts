import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

function mockK8s() {
  vi.doMock('../../src/config/k8s', () => ({
    makeApiClient: () => ({}),
    setCurrentContext: vi.fn(),
    getCurrentContext: () => 'test-context',
    getContexts: () => [{ name: 'test-context' }],
  }));
}

function mockConfigWith(tls: { cert?: string; key?: string }) {
  const cfg = {
    port: 7121,
    nodeEnv: 'test',
    sessionSecret: 'test-secret',
    kubeconfig: undefined,
    k8sContext: undefined,
    k8sNamespace: 'default',
    tlsCert: tls.cert,
    tlsKey: tls.key,
    tlsPort: 7122,
  };
  vi.doMock('../../src/config', () => ({
    config: cfg,
    isTlsEnabled: () => !!(cfg.tlsCert && cfg.tlsKey),
  }));
}

function parseCookies(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function hasSecureFlag(cookie: string): boolean {
  return cookie.split(';').some((part) => part.trim().toLowerCase() === 'secure');
}

function findCookie(cookies: string[], name: string): string | undefined {
  return cookies.find((c) => c.startsWith(`${name}=`));
}

describe('Cookie secure flag', () => {
  beforeEach(() => {
    vi.resetModules();
    mockK8s();
  });

  it('does not set Secure flag when TLS is not configured', async () => {
    mockConfigWith({});

    const { createApp } = await import('../../src/app');
    const app = createApp();
    const res = await request(app).get('/');
    const cookies = parseCookies(res);

    const session = findCookie(cookies, 'connect.sid');
    const csrf = findCookie(cookies, '_csrf');

    expect(session).toBeDefined();
    expect(csrf).toBeDefined();
    expect(hasSecureFlag(session!)).toBe(false);
    expect(hasSecureFlag(csrf!)).toBe(false);
  });

  it('sets Secure flag when TLS is configured', async () => {
    mockConfigWith({ cert: '/path/to/cert.pem', key: '/path/to/key.pem' });

    const { createApp } = await import('../../src/app');
    const app = createApp();
    app.set('trust proxy', 1);

    const res = await request(app).get('/').set('X-Forwarded-Proto', 'https');
    const cookies = parseCookies(res);

    const session = findCookie(cookies, 'connect.sid');
    const csrf = findCookie(cookies, '_csrf');

    expect(session).toBeDefined();
    expect(csrf).toBeDefined();
    expect(hasSecureFlag(session!)).toBe(true);
    expect(hasSecureFlag(csrf!)).toBe(true);
  });

  it('does not set Secure flag when only cert is provided without key', async () => {
    mockConfigWith({ cert: '/path/to/cert.pem' });

    const { createApp } = await import('../../src/app');
    const app = createApp();
    const res = await request(app).get('/');
    const cookies = parseCookies(res);

    const session = findCookie(cookies, 'connect.sid');
    const csrf = findCookie(cookies, '_csrf');

    expect(session).toBeDefined();
    expect(csrf).toBeDefined();
    expect(hasSecureFlag(session!)).toBe(false);
    expect(hasSecureFlag(csrf!)).toBe(false);
  });
});