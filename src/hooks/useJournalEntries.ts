"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { JournalEntry, Mood } from "@/types/journal";
import { generateId } from "@/lib/utils/idGenerator";

export function useJournalEntries() {
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>(
    "journal-entries",
    []
  );

  const addEntry = useCallback(
    (title: string, content: string, mood: Mood): JournalEntry => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        id: generateId(),
        title,
        content,
        mood,
        createdAt: now,
        updatedAt: now,
      };
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [setEntries]
  );

  const updateEntry = useCallback(
    (
      id: string,
      updates: Partial<Pick<JournalEntry, "title" | "content" | "mood">>
    ): JournalEntry | null => {
      let updated: JournalEntry | null = null;
      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id === id) {
            updated = {
              ...entry,
              ...updates,
              updatedAt: new Date().toISOString(),
            };
            return updated;
          }
          return entry;
        })
      );
      return updated;
    },
    [setEntries]
  );

  const deleteEntry = useCallback(
    (id: string): void => {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [setEntries]
  );

  const getEntry = useCallback(
    (id: string): JournalEntry | undefined => {
      return entries.find((entry) => entry.id === id);
    },
    [entries]
  );

  const searchEntries = useCallback(
    (query: string, moodFilter?: Mood | null): JournalEntry[] => {
      const lowerQuery = query.toLowerCase().trim();
      return entries.filter((entry) => {
        const matchesMood = !moodFilter || entry.mood === moodFilter;
        const matchesQuery =
          !lowerQuery ||
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.content.toLowerCase().includes(lowerQuery);
        return matchesMood && matchesQuery;
      });
    },
    [entries]
  );

  return { entries, addEntry, updateEntry, deleteEntry, getEntry, searchEntries };
}
