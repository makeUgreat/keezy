import { describe, it, expect, beforeEach } from 'vitest';
import { createMockApi, mockSecret, mockSecretList } from '../helpers/mockK8s';
import * as secretService from '../../src/services/secretService';

describe('secretService', () => {
  let api: ReturnType<typeof createMockApi>;

  beforeEach(() => {
    api = createMockApi();
  });

  describe('listSecrets', () => {
    it('returns mapped secret list items', async () => {
      api.listNamespacedSecret.mockResolvedValue(mockSecretList);

      const result = await secretService.listSecrets(api as any, 'default');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'test-secret',
        namespace: 'default',
        type: 'Opaque',
        dataCount: 2,
        creationTimestamp: new Date('2024-01-01'),
      });
    });

    it('handles empty list', async () => {
      api.listNamespacedSecret.mockResolvedValue({ items: [] });

      const result = await secretService.listSecrets(api as any, 'default');
      expect(result).toHaveLength(0);
    });
  });

  describe('getSecret', () => {
    it('returns decoded secret data', async () => {
      api.readNamespacedSecret.mockResolvedValue(mockSecret);

      const result = await secretService.getSecret(api as any, 'default', 'test-secret');

      expect(result.name).toBe('test-secret');
      expect(result.data).toEqual([
        { key: 'username', value: 'admin' },
        { key: 'password', value: 's3cret' },
      ]);
      expect(result.resourceVersion).toBe('12345');
    });
  });

  describe('createSecret', () => {
    it('creates a secret with base64-encoded data', async () => {
      api.createNamespacedSecret.mockResolvedValue({});

      await secretService.createSecret(api as any, 'default', {
        name: 'new-secret',
        type: 'Opaque',
        keys: ['key1', 'key2'],
        values: ['val1', 'val2'],
      });

      expect(api.createNamespacedSecret).toHaveBeenCalledTimes(1);
      const call = api.createNamespacedSecret.mock.calls[0][0];
      expect(call.body.metadata.name).toBe('new-secret');
      expect(call.body.data.key1).toBe(Buffer.from('val1').toString('base64'));
    });

    it('skips empty keys', async () => {
      api.createNamespacedSecret.mockResolvedValue({});

      await secretService.createSecret(api as any, 'default', {
        name: 'new-secret',
        keys: ['key1', '', '  '],
        values: ['val1', 'val2', 'val3'],
      });

      const call = api.createNamespacedSecret.mock.calls[0][0];
      expect(Object.keys(call.body.data)).toEqual(['key1']);
    });
  });

  describe('updateSecret', () => {
    it('updates secret with resourceVersion', async () => {
      api.readNamespacedSecret.mockResolvedValue(mockSecret);
      api.replaceNamespacedSecret.mockResolvedValue({});

      await secretService.updateSecret(api as any, 'default', 'test-secret', {
        keys: ['newkey'],
        values: ['newval'],
        resourceVersion: '12345',
      });

      const call = api.replaceNamespacedSecret.mock.calls[0][0];
      expect(call.body.metadata.resourceVersion).toBe('12345');
      expect(call.body.data.newkey).toBe(Buffer.from('newval').toString('base64'));
    });
  });

  describe('deleteSecret', () => {
    it('deletes the secret', async () => {
      api.deleteNamespacedSecret.mockResolvedValue({});

      await secretService.deleteSecret(api as any, 'default', 'test-secret');

      expect(api.deleteNamespacedSecret).toHaveBeenCalledWith({
        namespace: 'default',
        name: 'test-secret',
      });
    });
  });
});
