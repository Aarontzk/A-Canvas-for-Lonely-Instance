"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface SoundButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SoundButton({ icon: Icon, label, isActive, onClick }: SoundButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200 min-w-[52px]",
        isActive
          ? "bg-neon-blue/20 border-neon-blue/50 text-neon-blue shadow-[0_0_12px_rgba(0,212,255,0.3)]"
          : "bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
      )}
      aria-label={`${label} ${isActive ? "(playing)" : ""}`}
      aria-pressed={isActive}
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Icon size={16} />
      </motion.div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </motion.button>
  );
}
