import { getContexts, getCurrentContext, setCurrentContext } from '../config/k8s';

export interface ContextInfo {
  name: string;
  cluster: string;
  namespace?: string;
  isCurrent: boolean;
}

export function listContexts(): ContextInfo[] {
  const current = getCurrentContext();
  return getContexts().map((ctx) => ({
    name: ctx.name,
    cluster: ctx.cluster,
    namespace: ctx.namespace,
    isCurrent: ctx.name === current,
  }));
}

export function switchContext(name: string): void {
  const contexts = getContexts();
  const found = contexts.find((c) => c.name === name);
  if (!found) {
    throw new Error(`Context "${name}" not found`);
  }
  setCurrentContext(name);
}
