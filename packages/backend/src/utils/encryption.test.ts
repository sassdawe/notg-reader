import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './encryption.js';

beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32chars!!!!!';
});

describe('encryption', () => {
  it('should encrypt and decrypt a string', () => {
    const text = 'hello@example.com';
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted).toContain(':');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should produce different ciphertexts for the same input', () => {
    const text = 'test@test.com';
    const encrypted1 = encrypt(text);
    const encrypted2 = encrypt(text);
    expect(encrypted1).not.toBe(encrypted2);
    // But both should decrypt to the same value
    expect(decrypt(encrypted1)).toBe(text);
    expect(decrypt(encrypted2)).toBe(text);
  });

  it('should handle empty strings', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters', () => {
    const text = '日本語テスト🎉';
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should throw on invalid encrypted text format', () => {
    expect(() => decrypt('invalid')).toThrow('Invalid encrypted text format');
  });

  it('should throw on tampered ciphertext', () => {
    const encrypted = encrypt('test');
    const parts = encrypted.split(':');
    parts[3] = parts[3].replace(/[a-f0-9]/, 'x');
    expect(() => decrypt(parts.join(':'))).toThrow();
  });
});
