"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PageTransition } from "@/components/layout/PageTransition";
import { EntryCard } from "@/components/journal/EntryCard";
import { GhostMascot } from "@/components/mascot/GhostMascot";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { MOODS } from "@/lib/data/moods";
import type { Mood } from "@/types/journal";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PenLine } from "lucide-react";

const MOOD_KEYS = Object.keys(MOODS) as Mood[];

export default function HistoryPage() {
  const { searchEntries } = useJournalEntries();
  const [query, setQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null);

  const results = searchEntries(query, moodFilter);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Your canvas</h1>
          <p className="text-sm text-white/40 mt-1">
            {results.length} entr{results.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search your thoughts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
          />
        </div>

        {/* Mood filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setMoodFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              moodFilter === null
                ? "bg-white/15 border-white/30 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
            }`}
          >
            All
          </button>
          {MOOD_KEYS.map((mood) => {
            const meta = MOODS[mood];
            const isActive = moodFilter === mood;
            return (
              <button
                key={mood}
                onClick={() => setMoodFilter(isActive ? null : mood)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? `${meta.bgColor} ${meta.borderColor}`
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                }`}
                style={isActive ? { color: meta.color } : {}}
              >
                <span>{meta.emoji}</span>
                {meta.labelId}
              </button>
            );
          })}
        </div>

        {/* Entry list */}
        {results.length > 0 ? (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
              hidden: {},
            }}
          >
            {results.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <GhostMascot mood={null} size={100} />
            <div className="space-y-1">
              <p className="text-white/60 font-medium">
                {query || moodFilter
                  ? "No entries match your search."
                  : "No entries yet."}
              </p>
              <p className="text-sm text-white/30">
                {query || moodFilter
                  ? "Try different words or clear the filter."
                  : "Your canvas awaits. ✨"}
              </p>
            </div>
            {!query && !moodFilter && (
              <Link href="/write">
                <Button variant="primary" size="sm" glow>
                  <PenLine size={14} />
                  Write your first entry
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
