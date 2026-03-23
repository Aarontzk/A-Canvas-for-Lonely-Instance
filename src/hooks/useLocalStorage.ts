"use client";

import { useState, useEffect, useCallback } from "react";

function safeParse<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    // If fallback is an array, ensure parsed is also an array with no nulls
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      return parsed.filter((item) => item !== null && item !== undefined) as T;
    }
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read from localStorage on mount (client only)
  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(safeParse(item, initialValue));
    }
    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(safeParse(e.newValue, initialValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Use React functional update so we always write the latest value to storage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (error) {
          if (error instanceof DOMException && error.name === "QuotaExceededError") {
            console.error("LocalStorage quota exceeded");
          }
        }
        return next;
      });
    },
    [key]
  );

  return [isHydrated ? storedValue : initialValue, setValue];
}
