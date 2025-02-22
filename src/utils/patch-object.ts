/**
 * Patches object by provided set of keyPath and value pairs.
 */

import set from 'lodash.set';

type PatchSchema = Record<string, unknown>;

export function patchObject(obj: Record<string, unknown>, patchSchema: PatchSchema) {
  if (obj && typeof obj === 'object') {
    Object.keys(patchSchema).forEach((keyPath) => {
      set(obj, keyPath, patchSchema[keyPath]);
    });
  }
}
