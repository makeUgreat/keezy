export class K8sApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'K8sApiError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  public fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export function wrapK8sError(err: unknown): K8sApiError {
  if (err instanceof K8sApiError) return err;

  const e = err as { response?: { statusCode?: number }; body?: { message?: string }; message?: string };
  const statusCode = e.response?.statusCode || e.body?.message ? 500 : 500;
  const code = e.response?.statusCode || statusCode;
  const message = e.body?.message || e.message || 'Unknown Kubernetes API error';

  return new K8sApiError(message, code);
}
