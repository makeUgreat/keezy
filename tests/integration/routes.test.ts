import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { createMockApi, mockSecretList, mockSecret, mockNamespaceList } from '../helpers/mockK8s';

describe('Routes', () => {
  let api: ReturnType<typeof createMockApi>;
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    api = createMockApi();
    app = createTestApp(api);
  });

  describe('GET /', () => {
    it('redirects to /secrets', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/secrets');
    });
  });

  describe('GET /secrets', () => {
    it('renders secret list', async () => {
      api.listNamespacedSecret.mockResolvedValue(mockSecretList);

      const res = await request(app).get('/secrets');
      expect(res.status).toBe(200);
      expect(res.text).toContain('test-secret');
      expect(res.text).toContain('another-secret');
    });

    it('renders empty state', async () => {
      api.listNamespacedSecret.mockResolvedValue({ items: [] });

      const res = await request(app).get('/secrets');
      expect(res.status).toBe(200);
      expect(res.text).toContain('No secrets found');
    });
  });

  describe('GET /secrets/new', () => {
    it('renders create form', async () => {
      const res = await request(app).get('/secrets/new');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Create Secret');
    });
  });

  describe('GET /secrets/:name', () => {
    it('renders secret detail', async () => {
      api.readNamespacedSecret.mockResolvedValue(mockSecret);

      const res = await request(app).get('/secrets/test-secret');
      expect(res.status).toBe(200);
      expect(res.text).toContain('test-secret');
      expect(res.text).toContain('username');
    });
  });

  describe('GET /secrets/:name/edit', () => {
    it('renders edit form', async () => {
      api.readNamespacedSecret.mockResolvedValue(mockSecret);

      const res = await request(app).get('/secrets/test-secret/edit');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Edit Secret');
    });
  });

  describe('POST /secrets', () => {
    it('creates a secret and redirects', async () => {
      api.createNamespacedSecret.mockResolvedValue({});

      const res = await request(app)
        .post('/secrets')
        .type('form')
        .send({ name: 'new-secret', type: 'Opaque', keys: 'mykey', values: 'myval' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('/secrets/new-secret');
      expect(api.createNamespacedSecret).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /secrets/:name (update)', () => {
    it('updates a secret and redirects', async () => {
      api.readNamespacedSecret.mockResolvedValue(mockSecret);
      api.replaceNamespacedSecret.mockResolvedValue({});

      const res = await request(app)
        .post('/secrets/test-secret')
        .type('form')
        .send({ _method: 'PUT', keys: 'k', values: 'v', resourceVersion: '12345' });

      expect(res.status).toBe(302);
      expect(api.replaceNamespacedSecret).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /secrets/:name/delete', () => {
    it('deletes a secret and redirects', async () => {
      api.deleteNamespacedSecret.mockResolvedValue({});

      const res = await request(app)
        .post('/secrets/test-secret/delete')
        .type('form')
        .send({});

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/secrets');
      expect(api.deleteNamespacedSecret).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/namespaces', () => {
    it('returns namespace list as JSON', async () => {
      api.listNamespace.mockResolvedValue(mockNamespaceList);

      const res = await request(app).get('/api/namespaces');
      expect(res.status).toBe(200);
      expect(res.body.namespaces).toEqual(['default', 'kube-system', 'production']);
    });
  });

  describe('POST /namespace/switch', () => {
    it('switches namespace and redirects', async () => {
      const res = await request(app)
        .post('/namespace/switch')
        .type('form')
        .send({ namespace: 'production' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/secrets');
    });
  });

  describe('POST /context/switch', () => {
    it('redirects to /secrets', async () => {
      const res = await request(app)
        .post('/context/switch')
        .type('form')
        .send({ context: 'some-context' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/secrets');
    });
  });

  describe('404', () => {
    it('renders error page for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.text).toContain('Not Found');
    });
  });
});
