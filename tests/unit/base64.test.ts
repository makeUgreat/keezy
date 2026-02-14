import { describe, it, expect } from 'vitest';
import { encode, decode } from '../../src/utils/base64';

describe('base64', () => {
  it('encodes a string to base64', () => {
    expect(encode('hello')).toBe('aGVsbG8=');
  });

  it('decodes a base64 string', () => {
    expect(decode('aGVsbG8=')).toBe('hello');
  });

  it('handles empty strings', () => {
    expect(encode('')).toBe('');
    expect(decode('')).toBe('');
  });

  it('handles unicode characters', () => {
    const original = '한글 테스트';
    expect(decode(encode(original))).toBe(original);
  });

  it('roundtrips arbitrary values', () => {
    const values = ['password123', 'key=value&foo=bar', '{"json": true}'];
    for (const v of values) {
      expect(decode(encode(v))).toBe(v);
    }
  });
});
