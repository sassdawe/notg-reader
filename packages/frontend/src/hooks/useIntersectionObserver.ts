import { useEffect, useRef, useCallback } from 'react';

export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
) {
  const ref = useRef<HTMLElement | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          callbackRef.current(entry);
        });
      },
      { threshold: 0.5, ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return setRef;
}
