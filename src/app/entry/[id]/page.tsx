"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ghost, PenLine } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { EntryDetail } from "@/components/journal/EntryDetail";
import { GhostMascot } from "@/components/mascot/GhostMascot";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useGhostInteraction } from "@/hooks/useGhostInteraction";
import { Button } from "@/components/ui/Button";

interface EntryPageProps {
  params: { id: string };
}

export default function EntryPage({ params }: EntryPageProps) {
  const { id } = params;
  const { getEntry } = useJournalEntries();
  const entry = getEntry(id);
  const ghost = useGhostInteraction(entry?.mood ?? null);

  if (!entry) {
    return (
      <PageTransition>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-20 text-center"
        >
          <GhostMascot mood={null} size={110} />
          <div className="space-y-1">
            <p className="text-white/60 font-medium">Entry not found.</p>
            <p className="text-sm text-white/30">
              Maybe it was never written, or already deleted.
            </p>
          </div>
          <Link href="/history">
            <Button variant="secondary" size="sm">
              <Ghost size={14} />
              Back to history
            </Button>
          </Link>
        </motion.div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        <div className="flex-1 w-full">
          <EntryDetail entry={entry} />
        </div>
        <div className="lg:sticky lg:top-24 flex flex-col items-center w-full lg:w-40">
          <GhostMascot
            mood={ghost.currentMood}
            size={100}
            interactive
            isWiggling={ghost.isWiggling}
            dialogueLine={ghost.dialogueLine}
            onTap={ghost.onTap}
            onHoverStart={ghost.onHoverStart}
            onHoverEnd={ghost.onHoverEnd}
          />
          <Link href="/write" className="mt-4">
            <Button variant="secondary" size="sm">
              <PenLine size={14} />
              Write more
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
