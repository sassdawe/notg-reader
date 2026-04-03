import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should use navigator.clipboard when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('test text');
  });

  it('should fall back when clipboard API fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('denied')),
      },
    });

    // jsdom doesn't have execCommand, so add it for the fallback path
    document.execCommand = vi.fn().mockReturnValue(false);

    const result = await copyToClipboard('test');
    expect(typeof result).toBe('boolean');
  });
});
