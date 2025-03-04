import { describe, it, expect } from 'vitest';
import { replacePlaceholders } from '../src/response-builder/placeholders';

function replacePlaceholdersWithTypes(str: string, params: Record<string, string>) {
  return replacePlaceholders(str, params, { useTypes: true });
}

describe('replacePlaceholdersWithTypes', () => {
  it('string', () => {
    expect(replacePlaceholdersWithTypes('{{id}}', { id: '123' })).toEqual('123');
    expect(replacePlaceholdersWithTypes('{{ id  }}', { id: '123' })).toEqual('123');
    expect(replacePlaceholdersWithTypes('{{id}}', { id: '' })).toEqual('');
    expect(replacePlaceholdersWithTypes('{{id}}', {})).toEqual('{{id}}');
  });

  it('number', () => {
    expect(replacePlaceholdersWithTypes('{{id:number}}', { id: '123' })).toEqual(123);
    expect(replacePlaceholdersWithTypes('{{ id: number  }}', { id: '123' })).toEqual(123);
    expect(replacePlaceholdersWithTypes('{{id:number}}', { id: '0' })).toEqual(0);
    expect(replacePlaceholdersWithTypes('{{id:number}}', { id: 'bar' })).toEqual('bar');
    expect(replacePlaceholdersWithTypes('{{id:number}}', {})).toEqual('{{id:number}}');
  });

  it('boolean', () => {
    expect(replacePlaceholdersWithTypes('{{foo:boolean}}', { foo: 'true' })).toEqual(true);
    expect(replacePlaceholdersWithTypes('{{foo:boolean}}', { foo: 'false' })).toEqual(false);
    expect(replacePlaceholdersWithTypes('{{foo:boolean}}', { foo: '' })).toEqual(false);
    expect(replacePlaceholdersWithTypes('{{foo:boolean}}', { foo: 'bar' })).toEqual(true);
    expect(replacePlaceholdersWithTypes('{{foo:boolean}}', {})).toEqual('{{foo:boolean}}');
  });

  it('not only placeholder', () => {
    expect(replacePlaceholdersWithTypes('User {{id}}', { id: '123' })).toEqual('User 123');
    expect(replacePlaceholdersWithTypes('User {{id:number}}', { id: '123' })).toEqual('User 123');
    expect(replacePlaceholdersWithTypes('User {{foo:boolean}}', { foo: 'true' })).toEqual(
      'User true',
    );
  });
});

describe('replacePlaceholders', () => {
  it('always string', () => {
    expect(replacePlaceholders('{{id}}', { id: '123' })).toEqual('123');
    expect(replacePlaceholders('{{id:number}}', { id: '123' })).toEqual('123');
    expect(replacePlaceholders('{{foo:boolean}}', { foo: 'true' })).toEqual('true');
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
