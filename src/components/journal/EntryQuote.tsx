"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Mood } from "@/types/journal";
import { matchQuoteToEntry } from "@/lib/nlp/matchQuote";

interface EntryQuoteProps {
  readonly content: string;
  readonly mood: Mood;
}

const THEME_LABELS: Record<string, string> = {
  loneliness: "Kesepian",
  love: "Cinta",
  sadness: "Kesedihan",
  anger: "Kemarahan",
  anxiety: "Kecemasan",
  growth: "Pertumbuhan",
  peace: "Kedamaian",
  hope: "Harapan",
  strength: "Kekuatan",
  gratitude: "Syukur",
  work: "Pekerjaan",
  friendship: "Persahabatan",
  family: "Keluarga",
};

export function EntryQuote({ content, mood }: EntryQuoteProps) {
  const matched = useMemo(
    () => matchQuoteToEntry(content, mood),
    [content, mood]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6"
    >
      {/* Subtle glow background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl"
          style={{ background: "rgba(0, 212, 255, 0.15)" }}
        />
      </div>

      <div className="relative space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Sparkles size={12} className="text-neon-blue/60" />
          <span>Quote untuk kamu</span>
          <span className="px-2 py-0.5 rounded-full bg-neon-blue/10 text-neon-blue/60 text-[10px] font-medium">
            {THEME_LABELS[matched.theme] ?? matched.theme}
          </span>
        </div>

        {/* Quote text */}
        <p className="text-white/80 italic leading-relaxed text-sm sm:text-base">
          &ldquo;{matched.text}&rdquo;
        </p>

        {/* Author */}
        <p className="text-xs text-white/40">
          — {matched.author}
        </p>
      </div>
    </motion.div>
  );
}
