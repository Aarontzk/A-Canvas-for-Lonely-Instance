"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageTransition } from "@/components/layout/PageTransition";
import { EntryForm } from "@/components/journal/EntryForm";
import { GhostMascot } from "@/components/mascot/GhostMascot";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useGhostInteraction } from "@/hooks/useGhostInteraction";
import { MOODS } from "@/lib/data/moods";
import type { Mood, JournalEntry } from "@/types/journal";

function WritePageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { getEntry } = useJournalEntries();

  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [editEntry, setEditEntry] = useState<JournalEntry | undefined>();

  useEffect(() => {
    if (editId) {
      const entry = getEntry(editId);
      if (entry) {
        setEditEntry(entry);
        setCurrentMood(entry.mood);
      }
    }
  }, [editId, getEntry]);

  const ghost = useGhostInteraction(currentMood);
  const moodMeta = currentMood ? MOODS[currentMood] : null;

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Form */}
        <div className="flex-1 w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {editEntry ? "Edit entry" : "New entry"}
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {editEntry
                ? "Update your thoughts."
                : "Write freely. This is your safe space."}
            </p>
          </div>
          <EntryForm editEntry={editEntry} onMoodChange={setCurrentMood} />
        </div>

        {/* Mascot sidebar */}
        <div className="lg:sticky lg:top-24 flex flex-col items-center gap-4 w-full lg:w-48">
          <GhostMascot
            mood={ghost.currentMood}
            size={110}
            interactive
            isWiggling={ghost.isWiggling}
            dialogueLine={ghost.dialogueLine}
            onTap={ghost.onTap}
            onHoverStart={ghost.onHoverStart}
            onHoverEnd={ghost.onHoverEnd}
          />
          {moodMeta && (
            <div className="text-center px-3">
              <p className="text-sm text-white/60 leading-relaxed">
                {moodMeta.encouragement}
              </p>
            </div>
          )}
          {!moodMeta && (
            <p className="text-sm text-white/30 text-center px-3">
              Pick a mood and I&apos;ll be here with you ✨
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default function WritePage() {
  return (
    <Suspense>
      <WritePageContent />
    </Suspense>
  );
}
