import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('should return "Just now" for recent dates', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Just now');
  });

  it('should return minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:30:00Z'));
    expect(formatDate('2024-01-01T12:25:00Z')).toBe('5m ago');
    vi.useRealTimers();
  });

  it('should return hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T15:00:00Z'));
    expect(formatDate('2024-01-01T12:00:00Z')).toBe('3h ago');
    vi.useRealTimers();
  });

  it('should return days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-05T12:00:00Z'));
    expect(formatDate('2024-01-02T12:00:00Z')).toBe('3d ago');
    vi.useRealTimers();
  });

  it('should return formatted date for older dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-01T12:00:00Z'));
    const result = formatDate('2024-01-01T12:00:00Z');
    expect(result).toMatch(/\d+\/\d+\/\d+/);
    vi.useRealTimers();
  });
});
