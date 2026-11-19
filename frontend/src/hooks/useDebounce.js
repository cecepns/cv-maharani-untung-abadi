import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce values (e.g. search input)
 * Default delay is 400ms (>= 300ms required by rules)
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
