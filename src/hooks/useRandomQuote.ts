"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { QUOTES } from "@/lib/data/quotes";
import type { QuoteData } from "@/types/journal";

export function useRandomQuote(intervalMs = 30000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevIndexRef = useRef<number>(-1);

  const getRandomIndex = useCallback((excludeIndex: number): number => {
    if (QUOTES.length <= 1) return 0;
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === excludeIndex);
    return newIndex;
  }, []);

  const refreshQuote = useCallback(() => {
    const newIndex = getRandomIndex(currentIndex);
    prevIndexRef.current = currentIndex;
    setCurrentIndex(newIndex);
  }, [currentIndex, getRandomIndex]);

  // Auto-rotate quote
  useEffect(() => {
    const timer = setInterval(refreshQuote, intervalMs);
    return () => clearInterval(timer);
  }, [refreshQuote, intervalMs]);

  const quote: QuoteData = QUOTES[currentIndex];

  return { quote, refreshQuote };
}
