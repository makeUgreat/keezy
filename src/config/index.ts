export const config = {
  port: parseInt(process.env.PORT || '7121', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'keezy-dev-secret',
  kubeconfig: process.env.KUBECONFIG,
  k8sContext: process.env.K8S_CONTEXT,
  k8sNamespace: process.env.K8S_NAMESPACE || 'default',
};
