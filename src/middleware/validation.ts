import { body } from 'express-validator';

export const validateCreateSecret = [
  body('name')
    .trim()
    .notEmpty().withMessage('Secret name is required')
    .matches(/^[a-z0-9][a-z0-9.-]*[a-z0-9]$|^[a-z0-9]$/).withMessage('Invalid Kubernetes resource name'),
  body('keys')
    .custom((keys: string | string[]) => {
      const arr = Array.isArray(keys) ? keys : [keys];
      if (arr.length === 0 || arr.every((k) => !k.trim())) {
        throw new Error('At least one key is required');
      }
      return true;
    }),
];

export const validateUpdateSecret = [
  body('resourceVersion')
    .trim()
    .notEmpty().withMessage('resourceVersion is required'),
  body('keys')
    .custom((keys: string | string[]) => {
      const arr = Array.isArray(keys) ? keys : [keys];
      if (arr.length === 0 || arr.every((k) => !k.trim())) {
        throw new Error('At least one key is required');
      }
      return true;
    }),
];

export const validateNamespaceSwitch = [
  body('namespace')
    .trim()
    .notEmpty().withMessage('Namespace is required'),
];

export const validateContextSwitch = [
  body('context')
    .trim()
    .notEmpty().withMessage('Context is required'),
];
