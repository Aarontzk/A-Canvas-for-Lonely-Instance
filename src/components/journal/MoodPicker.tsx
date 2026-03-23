"use client";

import { motion } from "framer-motion";
import type { Mood } from "@/types/journal";
import { MOODS } from "@/lib/data/moods";
import { cn } from "@/lib/utils/cn";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

const MOOD_KEYS = Object.keys(MOODS) as Mood[];

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-white/50 font-medium">How are you feeling?</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {MOOD_KEYS.map((mood) => {
          const meta = MOODS[mood];
          const isSelected = value === mood;
          return (
            <motion.button
              key={mood}
              type="button"
              onClick={() => onChange(mood)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent",
                isSelected
                  ? `${meta.bgColor} ${meta.borderColor} shadow-lg`
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
              style={
                isSelected
                  ? { boxShadow: `0 0 16px ${meta.glowColor}` }
                  : {}
              }
              aria-label={meta.label}
              aria-pressed={isSelected}
            >
              <span className="text-xl leading-none">{meta.emoji}</span>
              <span
                className="text-xs font-medium leading-none"
                style={{ color: isSelected ? meta.color : "rgba(255,255,255,0.5)" }}
              >
                {meta.labelId}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
