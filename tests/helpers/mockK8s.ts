import { vi } from 'vitest';

export function createMockApi() {
  return {
    listNamespacedSecret: vi.fn(),
    readNamespacedSecret: vi.fn(),
    createNamespacedSecret: vi.fn(),
    replaceNamespacedSecret: vi.fn(),
    deleteNamespacedSecret: vi.fn(),
    listNamespace: vi.fn(),
  };
}

export const mockSecret = {
  metadata: {
    name: 'test-secret',
    namespace: 'default',
    resourceVersion: '12345',
    creationTimestamp: new Date('2024-01-01'),
  },
  type: 'Opaque',
  data: {
    username: Buffer.from('admin').toString('base64'),
    password: Buffer.from('s3cret').toString('base64'),
  },
};

export const mockSecretList = {
  items: [
    mockSecret,
    {
      metadata: {
        name: 'another-secret',
        namespace: 'default',
        resourceVersion: '67890',
        creationTimestamp: new Date('2024-01-02'),
      },
      type: 'Opaque',
      data: { key1: Buffer.from('value1').toString('base64') },
    },
  ],
};

export const mockNamespaceList = {
  items: [
    { metadata: { name: 'default' } },
    { metadata: { name: 'kube-system' } },
    { metadata: { name: 'production' } },
  ],
};
