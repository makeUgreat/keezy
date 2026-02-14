declare namespace Express {
  interface Request {
    k8sApi?: import('@kubernetes/client-node').CoreV1Api;
  }
}
