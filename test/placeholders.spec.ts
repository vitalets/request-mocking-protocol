import { it, expect } from 'vitest';
import { replacePlaceholders } from '../src/response-builder/placeholders';
import { describe } from 'node:test';

describe('only placeholder', () => {
  it('string', () => {
    expect(replacePlaceholders('{{id}}', { id: '123' })).toEqual('123');
    expect(replacePlaceholders('{{ id  }}', { id: '123' })).toEqual('123');
    expect(replacePlaceholders('{{id}}', { id: '' })).toEqual('');
    expect(replacePlaceholders('{{id}}', {})).toEqual('{{id}}');
  });

  it('number', () => {
    expect(replacePlaceholders('{{id:number}}', { id: '123' })).toEqual(123);
    expect(replacePlaceholders('{{ id: number  }}', { id: '123' })).toEqual(123);
    expect(replacePlaceholders('{{id:number}}', { id: '0' })).toEqual(0);
    expect(replacePlaceholders('{{id:number}}', { id: 'bar' })).toEqual('bar');
    expect(replacePlaceholders('{{id:number}}', {})).toEqual('{{id:number}}');
  });

  it('boolean', () => {
    expect(replacePlaceholders('{{foo:boolean}}', { foo: 'true' })).toEqual(true);
    expect(replacePlaceholders('{{foo:boolean}}', { foo: 'false' })).toEqual(false);
    expect(replacePlaceholders('{{foo:boolean}}', { foo: '' })).toEqual(false);
    expect(replacePlaceholders('{{foo:boolean}}', { foo: 'bar' })).toEqual(true);
    expect(replacePlaceholders('{{foo:boolean}}', {})).toEqual('{{foo:boolean}}');
  });
});

describe('not only placeholder', () => {
  it('replace all types as strings', () => {
    expect(replacePlaceholders('User {{id}}', { id: '123' })).toEqual('User 123');
    expect(replacePlaceholders('User {{id:number}}', { id: '123' })).toEqual('User 123');
    expect(replacePlaceholders('User {{foo:boolean}}', { foo: 'true' })).toEqual('User true');
  });

  it('multiple placeholders', () => {
    expect(
      replacePlaceholders('User {{id}} {{ id }} {{id:number}} {{foo:boolean}}', {
        id: '42',
        foo: 'true',
      }),
    ).toEqual('User 42 42 42 true');
  });

  it('missing variables', () => {
    expect(replacePlaceholders('User {{id}}', {})).toEqual('User {{id}}');
    // @ts-expect-error for non-ts cases
    expect(replacePlaceholders('User {{id}}', { id: undefined })).toEqual('User {{id}}');
  });

  it('does not replace non-matching values', () => {
    expect(replacePlaceholders('static text', { id: '42' })).toEqual('static text');
  });
});
