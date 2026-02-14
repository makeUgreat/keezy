import * as k8s from '@kubernetes/client-node';
import { encode, decode } from '../utils/base64';
import { wrapK8sError, K8sApiError } from '../utils/errors';
import { SecretDTO, SecretListItem, CreateSecretInput, UpdateSecretInput } from '../types/secrets';

export async function listSecrets(api: k8s.CoreV1Api, namespace: string): Promise<SecretListItem[]> {
  try {
    const res = await api.listNamespacedSecret({ namespace });
    return (res.items || []).map((s) => ({
      name: s.metadata?.name || '',
      namespace: s.metadata?.namespace || namespace,
      type: s.type || 'Opaque',
      dataCount: s.data ? Object.keys(s.data).length : 0,
      creationTimestamp: s.metadata?.creationTimestamp,
    }));
  } catch (err) {
    throw wrapK8sError(err);
  }
}

export async function getSecret(api: k8s.CoreV1Api, namespace: string, name: string): Promise<SecretDTO> {
  try {
    const s = await api.readNamespacedSecret({ namespace, name });

    const data = s.data
      ? Object.entries(s.data).map(([key, value]) => ({
          key,
          value: decode(value),
        }))
      : [];

    return {
      name: s.metadata?.name || name,
      namespace: s.metadata?.namespace || namespace,
      type: s.type || 'Opaque',
      data,
      labels: s.metadata?.labels,
      annotations: s.metadata?.annotations,
      resourceVersion: s.metadata?.resourceVersion,
      creationTimestamp: s.metadata?.creationTimestamp,
    };
  } catch (err) {
    throw wrapK8sError(err);
  }
}

export async function createSecret(
  api: k8s.CoreV1Api,
  namespace: string,
  input: CreateSecretInput,
): Promise<void> {
  const data: Record<string, string> = {};
  const keys = Array.isArray(input.keys) ? input.keys : [input.keys];
  const values = Array.isArray(input.values) ? input.values : [input.values];

  keys.forEach((key, i) => {
    if (key.trim()) {
      data[key.trim()] = encode(values[i] || '');
    }
  });

  try {
    await api.createNamespacedSecret({
      namespace,
      body: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: { name: input.name, namespace },
        type: input.type || 'Opaque',
        data,
      },
    });
  } catch (err) {
    throw wrapK8sError(err);
  }
}

export async function updateSecret(
  api: k8s.CoreV1Api,
  namespace: string,
  name: string,
  input: UpdateSecretInput,
): Promise<void> {
  const data: Record<string, string> = {};
  const keys = Array.isArray(input.keys) ? input.keys : [input.keys];
  const values = Array.isArray(input.values) ? input.values : [input.values];

  keys.forEach((key, i) => {
    if (key.trim()) {
      data[key.trim()] = encode(values[i] || '');
    }
  });

  try {
    const existing = await api.readNamespacedSecret({ namespace, name });

    await api.replaceNamespacedSecret({
      namespace,
      name,
      body: {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name,
          namespace,
          resourceVersion: input.resourceVersion,
        },
        type: existing.type || 'Opaque',
        data,
      },
    });
  } catch (err) {
    const wrapped = wrapK8sError(err);
    if (wrapped.statusCode === 409) {
      throw new K8sApiError(
        'Secret was modified by another user. Please refresh and try again.',
        409,
      );
    }
    throw wrapped;
  }
}

export async function deleteSecret(
  api: k8s.CoreV1Api,
  namespace: string,
  name: string,
): Promise<void> {
  try {
    await api.deleteNamespacedSecret({ namespace, name });
  } catch (err) {
    throw wrapK8sError(err);
  }
}
