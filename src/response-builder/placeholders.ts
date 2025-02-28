/**
 * A module to replace placeholders in the JSON object.
 * Supports type hints, see tests.
 */

/* eslint-disable visual/complexity */

import cloneDeepWith from 'lodash/cloneDeepWith';

export function replacePlaceholders(obj: object, variables: Record<string, string>) {
  return cloneDeepWith(obj, (value: unknown) => {
    if (typeof value !== 'string') return;

    // Find all placeholder matches
    const matches = [...value.matchAll(/\{\{\s*(\w+)(?::(number|boolean))?\s*\}\}/g)];
    const firstMatch = matches[0];

    // No placeholders found
    if (!firstMatch) return;

    const isSinglePlaceholder = matches.length === 1 && value.trim() === firstMatch[0];

    if (isSinglePlaceholder) {
      // If the whole value is a single placeholder, apply type conversion
      return replaceSinglePlaceholder(firstMatch, variables);
    } else {
      // Multiple placeholders -> always replace with string
      return replaceMultiplePlaceholders(matches, value, variables);
    }
  });
}

function replaceSinglePlaceholder(match: RegExpExecArray, variables: Record<string, string>) {
  const [, key, typeHint] = match;

  if (!key || !Object.hasOwn(variables, key)) return;
  const replacement = variables[key];

  if (typeHint === 'number') {
    const number = Number(replacement);
    if (!Number.isNaN(number)) return number;
  }

  if (typeHint === 'boolean') {
    return Boolean(replacement && replacement.toLowerCase() !== 'false');
  }

  return replacement;
}

function replaceMultiplePlaceholders(
  matches: RegExpMatchArray[],
  value: string,
  variables: Record<string, string>,
) {
  for (const [match, key] of matches) {
    if (!key || !Object.hasOwn(variables, key)) continue;
    const replacement = variables[key];
    value = value.replaceAll(match, replacement ?? '');
  }
  return value;
}
