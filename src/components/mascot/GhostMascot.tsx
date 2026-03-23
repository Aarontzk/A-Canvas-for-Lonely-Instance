"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GhostMood } from "./ghostExpressions";
import { GHOST_EXPRESSIONS } from "./ghostExpressions";
import { GhostAura } from "./GhostAura";

interface GhostMascotProps {
  mood?: GhostMood | null;
  size?: number;
  className?: string;
  interactive?: boolean;
  isWiggling?: boolean;
  dialogueLine?: string | null;
  onTap?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function GhostMascot({
  mood = null,
  size = 120,
  className = "",
  interactive = false,
  isWiggling = false,
  dialogueLine = null,
  onTap,
  onHoverStart,
  onHoverEnd,
}: GhostMascotProps) {
  const key = mood ?? "idle";
  const expr = GHOST_EXPRESSIONS[key];

  const showBlush = key === "happy" || key === "hopeful" || key === "love";

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size + 40 }}
    >
      {/* Speech bubble */}
      <AnimatePresence>
        {dialogueLine && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-10
              bg-white/90 text-gray-800 text-xs font-medium
              px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap
              pointer-events-none"
            style={{ minWidth: 40 }}
          >
            {dialogueLine}
            {/* Bubble tail */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2
              w-2.5 h-2.5 bg-white/90 rotate-45 rounded-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <GhostAura
        color={expr.auraColor}
        intensity={key === "hopeful" ? 1.2 : key === "annoyed" ? 1.4 : 1}
        isFlickering={key === "anxious" || key === "annoyed"}
      />

      <motion.div
        animate={
          isWiggling
            ? { y: [0, -10, 0], rotate: [0, -5, 5, -3, 0] }
            : { y: [0, -10, 0] }
        }
        transition={
          isWiggling
            ? { duration: 0.5, repeat: 0, ease: "easeInOut" }
            : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        }
        style={{ cursor: interactive ? "pointer" : "default" }}
        onClick={interactive ? onTap : undefined}
        onMouseEnter={interactive ? onHoverStart : undefined}
        onMouseLeave={interactive ? onHoverEnd : undefined}
        onTouchStart={interactive ? onTap : undefined}
      >
        <motion.svg
          viewBox="0 0 88 100"
          width={size}
          height={size}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {/* Ghost body */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`body-${key}`}
              d="M 44 8 C 18 8 10 28 10 50 C 10 70 12 82 18 88 C 22 92 26 90 30 86 C 34 82 38 82 44 86 C 50 82 54 82 58 86 C 62 90 66 92 70 88 C 76 82 78 70 78 50 C 78 28 70 8 44 8 Z"
              fill={expr.bodyColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {/* Body shading */}
          <ellipse cx="44" cy="45" rx="20" ry="25" fill="rgba(255,255,255,0.12)" />

          {/* Eyes */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`eyes-${key}`}
              d={expr.eyes}
              fill="rgba(15, 23, 42, 0.85)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Mouth */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`mouth-${key}`}
              d={expr.mouth}
              stroke="rgba(15, 23, 42, 0.75)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              exit={{ opacity: 0, pathLength: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {/* Blush circles */}
          {showBlush && (
            <>
              <motion.ellipse
                cx="24" cy="50" rx="6" ry="4"
                fill="rgba(251, 113, 133, 0.4)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
              <motion.ellipse
                cx="64" cy="50" rx="6" ry="4"
                fill="rgba(251, 113, 133, 0.4)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </>
          )}

          {/* Sweat drop (anxious or annoyed) */}
          {(key === "anxious" || key === "annoyed") && (
            <motion.ellipse
              cx="68" cy="32" rx="3" ry="5"
              fill="rgba(147, 197, 253, 0.8)"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Zzz (tired) */}
          {key === "tired" && (
            <motion.text
              x="66" y="26" fontSize="10"
              fill="rgba(148, 163, 184, 0.9)"
              fontFamily="sans-serif" fontWeight="bold"
              animate={{ opacity: [0.3, 1, 0.3], y: [26, 22, 26] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              z
            </motion.text>
          )}

          {/* Hearts (love) */}
          {key === "love" && (
            <>
              <motion.text
                x="14" y="28" fontSize="10"
                animate={{ opacity: [0.3, 1, 0.3], y: [28, 22, 28] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ❤
              </motion.text>
              <motion.text
                x="68" y="24" fontSize="8"
                animate={{ opacity: [0.5, 1, 0.5], y: [24, 19, 24] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
              >
                ❤
              </motion.text>
            </>
          )}

          {/* Angry puff (annoyed) */}
          {key === "annoyed" && (
            <motion.text
              x="12" y="22" fontSize="12"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              💢
            </motion.text>
          )}

          {/* Surprised sparkle */}
          {key === "surprised" && (
            <>
              <motion.text
                x="10" y="20" fontSize="8"
                animate={{ opacity: [0, 1, 0], y: [20, 14, 20] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                ✦
              </motion.text>
              <motion.text
                x="72" y="24" fontSize="6"
                animate={{ opacity: [0, 1, 0], y: [24, 18, 24] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              >
                ✦
              </motion.text>
            </>
          )}
        </motion.svg>
      </motion.div>
    </div>
  );
}
