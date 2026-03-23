"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, CloudRain, Wind, Trees, X } from "lucide-react";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { SoundButton } from "./SoundButton";
import { VolumeSlider } from "./VolumeSlider";
import type { AmbientSound } from "@/types/journal";

const SOUNDS: { id: AmbientSound; icon: typeof CloudRain; label: string }[] = [
  { id: "rain", icon: CloudRain, label: "Rain" },
  { id: "whitenoise", icon: Wind, label: "Noise" },
  { id: "forest", icon: Trees, label: "Forest" },
];

export function AmbientPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, toggle, setVolume } = useAmbientSound();

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-3 p-4 rounded-2xl bg-navy-800/95 backdrop-blur-md border border-white/10 shadow-2xl w-52 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60 tracking-wide uppercase">
                Ambient
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="flex gap-2 justify-between">
              {SOUNDS.map(({ id, icon, label }) => (
                <SoundButton
                  key={id}
                  icon={icon}
                  label={label}
                  isActive={state.activeSound === id && state.isPlaying}
                  onClick={() => toggle(id)}
                />
              ))}
            </div>

            <VolumeSlider value={state.volume} onChange={setVolume} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          w-11 h-11 rounded-full flex items-center justify-center shadow-lg
          border transition-all duration-200
          ${
            state.isPlaying
              ? "bg-neon-blue/20 border-neon-blue/50 text-neon-blue shadow-[0_0_20px_rgba(0,212,255,0.4)]"
              : "bg-navy-800/90 border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
          }
        `}
        aria-label="Toggle ambient sounds"
      >
        <motion.div
          animate={state.isPlaying ? { rotate: [0, 360] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Music size={18} />
        </motion.div>
      </motion.button>
    </div>
  );
}
