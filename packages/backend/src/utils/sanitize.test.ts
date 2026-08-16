import { describe, it, expect } from 'vitest';
import { sanitizeContent, sanitizeText } from './sanitize.js';

describe('sanitize', () => {
  describe('sanitizeContent', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      expect(sanitizeContent(html)).toBe(html);
    });

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>';
      expect(sanitizeContent(html)).toBe('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const html = '<img src="test.jpg" onerror="alert(1)" />';
      const result = sanitizeContent(html);
      expect(result).not.toContain('onerror');
    });

    it('should allow img tags with safe attributes', () => {
      const html = '<img src="https://example.com/img.jpg" alt="test" />';
      expect(sanitizeContent(html)).toContain('src="https://example.com/img.jpg"');
    });

    it('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeContent(html);
      expect(result).not.toContain('javascript:');
    });
  });

  describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
      expect(sanitizeText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeText('')).toBe('');
    });
  });
});
