import { it, expect } from 'vitest';
import { replacePlaceholders } from '../src/response-builder/placeholders';

it('replaces single placeholder with type hint (number)', () => {
  expect(replacePlaceholders({ id: '{{id:number}}' }, { id: '123' })).toEqual({ id: 123 });
});

it('replaces single placeholder with type hint (boolean, true)', () => {
  expect(replacePlaceholders({ active: '{{isActive:boolean}}' }, { isActive: 'true' })).toEqual({
    active: true,
  });
});

it('replaces single placeholder with type hint (boolean, false)', () => {
  expect(replacePlaceholders({ active: '{{isActive:boolean}}' }, { isActive: 'false' })).toEqual({
    active: false,
  });
});

it('fallbacks to string when type hint conversion fails (number)', () => {
  expect(replacePlaceholders({ id: '{{id:number}}' }, { id: 'notANumber' })).toEqual({
    id: 'notANumber',
  });
});

it('fallbacks to true when type hint conversion fails (boolean)', () => {
  expect(replacePlaceholders({ flag: '{{flag:boolean}}' }, { flag: 'maybe' })).toEqual({
    flag: true,
  });
});

it('replaces inline placeholders as strings', () => {
  expect(replacePlaceholders({ title: 'User {{id:number}} {{id}}' }, { id: '42' })).toEqual({
    title: 'User 42 42',
  });
});

it('handles missing variables gracefully', () => {
  expect(replacePlaceholders({ title: 'User {{id}}' }, {})).toEqual({ title: 'User {{id}}' });
});

it('supports nested objects', () => {
  expect(
    replacePlaceholders(
      {
        user: {
          id: '{{id:number}}',
          name: '{{username}}',
          active: '{{isActive:boolean}}',
        },
      },
      { id: '123', username: 'Alice', isActive: 'true' },
    ),
  ).toEqual({
    user: {
      id: 123,
      name: 'Alice',
      active: true,
    },
  });
});

it('supports arrays', () => {
  expect(
    replacePlaceholders(['{{id:number}}', 'Hello {{username}}'], { id: '100', username: 'Bob' }),
  ).toEqual([100, 'Hello Bob']);
});

it('handles multiple replacements in an array', () => {
  expect(replacePlaceholders(['User {{id:number}} {{id}}'], { id: '99' })).toEqual(['User 99 99']);
});

it('does not replace non-matching values', () => {
  expect(replacePlaceholders({ key: 'static text' }, { id: '42' })).toEqual({
    key: 'static text',
  });
});
