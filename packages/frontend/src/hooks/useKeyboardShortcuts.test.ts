import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should call handler on key press', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'j': handler }));

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when typing in input', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'j': handler }));

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'j', bubbles: true });
    input.dispatchEvent(event);

    // Handler should not be called when target is an input
    expect(handler).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('should handle modifier keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 'Ctrl+s': handler }));

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
    document.dispatchEvent(event);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
