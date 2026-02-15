export interface Config {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
  kubeconfig: string | undefined;
  k8sContext: string | undefined;
  k8sNamespace: string;
  tlsCert: string | undefined;
  tlsKey: string | undefined;
  tlsPort: number;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '7121', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'keezy-dev-secret',
  kubeconfig: process.env.KUBECONFIG,
  k8sContext: process.env.K8S_CONTEXT,
  k8sNamespace: process.env.K8S_NAMESPACE || 'default',
  tlsCert: process.env.TLS_CERT,
  tlsKey: process.env.TLS_KEY,
  tlsPort: parseInt(process.env.TLS_PORT || '7122', 10),
};

export function isTlsEnabled(c: Config): c is Config & { tlsCert: string; tlsKey: string } {
  return !!(c.tlsCert && c.tlsKey);
}
