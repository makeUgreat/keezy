import * as k8s from '@kubernetes/client-node';
import { config } from './index';

const kc = new k8s.KubeConfig();

try {
  kc.loadFromDefault();
} catch {
  kc.loadFromCluster();
}

if (config.k8sContext) {
  kc.setCurrentContext(config.k8sContext);
}

export function getKubeConfig(): k8s.KubeConfig {
  return kc;
}

export function makeApiClient(): k8s.CoreV1Api {
  return kc.makeApiClient(k8s.CoreV1Api);
}

export function getContexts(): k8s.Context[] {
  return kc.getContexts();
}

export function getCurrentContext(): string {
  return kc.getCurrentContext();
}

export function setCurrentContext(contextName: string): void {
  kc.setCurrentContext(contextName);
}
