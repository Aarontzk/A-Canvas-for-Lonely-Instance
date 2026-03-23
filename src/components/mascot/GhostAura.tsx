"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GhostAuraProps {
  color: string;
  intensity?: number;
  isFlickering?: boolean;
}

export function GhostAura({
  color,
  intensity = 1,
  isFlickering = false,
}: GhostAuraProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={color}
        className="absolute inset-0 -z-10 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
          filter: "blur(20px)",
          transform: "scale(1.5)",
        }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={
          isFlickering
            ? {
                opacity: [0.4, 0.8, 0.3, 0.9, 0.5],
                scale: [1.4, 1.6, 1.3, 1.7, 1.5],
              }
            : {
                opacity: [0.4 * intensity, 0.8 * intensity, 0.4 * intensity],
                scale: [1.4, 1.6, 1.4],
              }
        }
        exit={{ opacity: 0, scale: 1 }}
        transition={
          isFlickering
            ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </AnimatePresence>
  );
}
