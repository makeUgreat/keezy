import * as k8s from '@kubernetes/client-node';
import { wrapK8sError } from '../utils/errors';

export async function listNamespaces(api: k8s.CoreV1Api): Promise<string[]> {
  try {
    const res = await api.listNamespace();
    return (res.items || [])
      .map((ns) => ns.metadata?.name)
      .filter((name): name is string => !!name)
      .sort();
  } catch (err) {
    throw wrapK8sError(err);
  }
}
