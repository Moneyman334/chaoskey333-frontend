import { useCallback, useRef } from 'react';

/**
 * Custom hook for throttling function calls to optimize performance
 * Uses requestAnimationFrame for smooth animations and caps CPU/GPU usage
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallTime.current >= delay) {
      // Execute immediately if enough time has passed
      lastCallTime.current = now;
      callback(...args);
    } else {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule execution for later
      timeoutRef.current = setTimeout(() => {
        lastCallTime.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallTime.current));
    }
  }, [callback, delay]) as T;
};