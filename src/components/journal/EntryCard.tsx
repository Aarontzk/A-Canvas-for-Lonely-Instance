"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { JournalEntry } from "@/types/journal";
import { MOODS } from "@/lib/data/moods";
import { formatRelativeDate } from "@/lib/utils/dateFormat";

interface EntryCardProps {
  entry: JournalEntry;
  index?: number;
}

export function EntryCard({ entry, index = 0 }: EntryCardProps) {
  const mood = MOODS[entry.mood];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ scale: 1.01, y: -2 }}
    >
      <Link href={`/entry/${entry.id}`}>
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 cursor-pointer transition-all duration-200 hover:bg-white/8 hover:border-white/20 group"
          style={{
            borderLeftWidth: "3px",
            borderLeftColor: mood.color,
          }}
        >
          {/* Subtle glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(ellipse at left, ${mood.glowColor.replace("0.5", "0.08")} 0%, transparent 60%)`,
            }}
          />

          <div className="relative space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg leading-none flex-shrink-0">{mood.emoji}</span>
                <h3 className="font-semibold text-white truncate">{entry.title}</h3>
              </div>
              <span className="text-xs text-white/40 flex-shrink-0 pt-0.5">
                {formatRelativeDate(entry.createdAt)}
              </span>
            </div>

            {/* Preview */}
            <p className="text-sm text-white/50 line-clamp-2 leading-relaxed">
              {entry.content}
            </p>

            {/* Mood badge */}
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${mood.bgColor}`}
              style={{ color: mood.color }}
            >
              {mood.labelId}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
