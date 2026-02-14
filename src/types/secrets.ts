export interface SecretEntry {
  key: string;
  value: string;
}

export interface SecretDTO {
  name: string;
  namespace: string;
  type: string;
  data: SecretEntry[];
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  resourceVersion?: string;
  creationTimestamp?: Date;
}

export interface SecretListItem {
  name: string;
  namespace: string;
  type: string;
  dataCount: number;
  creationTimestamp?: Date;
}

export interface CreateSecretInput {
  name: string;
  type?: string;
  keys: string[];
  values: string[];
}

export interface UpdateSecretInput {
  keys: string[];
  values: string[];
  resourceVersion: string;
}
