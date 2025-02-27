/**
 * Mock response utils.
 */

import set from 'lodash.set';

/**
 * Patches object by provided set of keyPath and value pairs.
 */
export function patchObject(
  obj?: Record<string, unknown> | null,
  patchSchema?: Record<string, unknown>,
) {
  if (obj && typeof obj === 'object' && patchSchema) {
    Object.keys(patchSchema).forEach((keyPath) => {
      set(obj, keyPath, patchSchema[keyPath]);
    });
  }
}
