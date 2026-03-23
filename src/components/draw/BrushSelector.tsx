"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type BrushType = "pen" | "crayon" | "spray" | "eraser";

const BRUSHES: { id: BrushType; label: string; emoji: string; desc: string }[] = [
  { id: "pen", label: "Pen", emoji: "🖊️", desc: "Smooth line" },
  { id: "crayon", label: "Crayon", emoji: "🖍️", desc: "Textured" },
  { id: "spray", label: "Spray", emoji: "💨", desc: "Splatter" },
  { id: "eraser", label: "Eraser", emoji: "🧹", desc: "Erase" },
];

interface BrushSelectorProps {
  value: BrushType;
  onChange: (brush: BrushType) => void;
}

export function BrushSelector({ value, onChange }: BrushSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/40 font-medium">Brush</p>
      <div className="grid grid-cols-4 gap-1.5">
        {BRUSHES.map(({ id, label, emoji }) => (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all",
              value === id
                ? "bg-neon-blue/20 border-neon-blue/50 text-neon-blue"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
            )}
          >
            <span className="text-base">{emoji}</span>
            <span className="font-medium leading-none">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
