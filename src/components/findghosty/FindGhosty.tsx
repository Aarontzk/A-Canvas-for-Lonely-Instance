"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { GhostSprite } from "./GhostSprite";
import { generateGhosts, LEVELS, type GhostEntity, type LevelConfig } from "./ghostFactory";

const WRONG_FLASH_MS = 500;

const FOUND_MESSAGES = [
  "Ketemu! 👻",
  "Hebat!",
  "Mata tajam! 👀",
  "Ghosty ditemukan!",
  "Keren!",
  "Jeli banget!",
];

const WRONG_MESSAGES = [
  "Bukan itu!",
  "Coba lagi~",
  "Yang lain!",
  "Hmm, bukan...",
  "Hampir!",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function FindGhosty() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [ghosts, setGhosts] = useState<readonly GhostEntity[]>([]);
  const [found, setFound] = useState(false);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [mounted, setMounted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(0);

  const level = LEVELS[levelIdx];

  const startRound = useCallback((config: LevelConfig) => {
    setGhosts(generateGhosts(config));
    setFound(false);
    setWrongId(null);
    setWrongCount(0);
    setMessage(null);
    setElapsed(0);
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 100) / 10);
    }, 100);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) startRound(LEVELS[levelIdx]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleLevelChange = (idx: number) => {
    setLevelIdx(idx);
    setStreak(0);
    startRound(LEVELS[idx]);
  };

  const handleClick = useCallback((id: number) => {
    if (found) return;

    const ghost = ghosts.find((g) => g.id === id);
    if (!ghost) return;

    if (ghost.isReal) {
      // Found it!
      setFound(true);
      setMessage(pick(FOUND_MESSAGES));
      setStreak((s) => s + 1);
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 100) / 10);
    } else {
      // Wrong pick
      setWrongId(id);
      setWrongCount((c) => c + 1);
      setMessage(pick(WRONG_MESSAGES));
      setTimeout(() => {
        setWrongId(null);
        setMessage(null);
      }, WRONG_FLASH_MS);
    }
  }, [found, ghosts]);

  const handleNext = () => {
    startRound(level);
  };

  const handleLevelUp = () => {
    if (levelIdx < LEVELS.length - 1) {
      const next = levelIdx + 1;
      setLevelIdx(next);
      startRound(LEVELS[next]);
    } else {
      startRound(level);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Level selector */}
        <div className="flex items-center gap-1.5">
          {LEVELS.map((l, i) => (
            <button
              key={l.level}
              onClick={() => handleLevelChange(i)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                levelIdx === i
                  ? "bg-neon-purple/20 border-neon-purple/50 text-purple-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* New round */}
        <Button variant="secondary" size="sm" onClick={() => startRound(level)}>
          <RotateCcw size={14} /> Acak Ulang
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-white/50">
          <Timer size={14} />
          <span>{elapsed.toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <Zap size={14} className={streak >= 3 ? "text-yellow-400" : ""} />
          <span>
            Streak: <span className={streak >= 3 ? "text-yellow-400 font-bold" : ""}>{streak}</span>
          </span>
        </div>
        {wrongCount > 0 && (
          <span className="text-red-400/60 text-xs">
            Salah: {wrongCount}
          </span>
        )}
      </div>

      {/* Hint: what Ghosty looks like */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
        <svg viewBox="0 0 88 100" width={32} height={32}>
          <path
            d="M 44 8 C 18 8 10 28 10 50 C 10 70 12 82 18 88 C 22 92 26 90 30 86 C 34 82 38 82 44 86 C 50 82 54 82 58 86 C 62 90 66 92 70 88 C 76 82 78 70 78 50 C 78 28 70 8 44 8 Z"
            fill="#a5b4fc"
          />
          <path
            d="M 28 38 Q 32 34 36 38 Q 32 42 28 38 Z M 52 38 Q 56 34 60 38 Q 56 42 52 38 Z"
            fill="rgba(15,23,42,0.85)"
          />
          <path d="M 35 54 Q 44 58 53 54" stroke="rgba(15,23,42,0.7)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
        <p className="text-xs text-white/40">
          Cari Ghosty yang asli! Warna ungu lembut, bentuk standar, tanpa aksesoris.
        </p>
      </div>

      {/* Game board */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-navy-900/60 select-none"
        style={{ width: "100%", paddingBottom: "70%", minHeight: 280 }}
      >
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(165,180,252,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(192,132,252,0.08) 0%, transparent 50%)`,
          }}
        />

        {/* Ghost sprites */}
        {ghosts.map((g) => (
          <GhostSprite
            key={g.id}
            ghost={g}
            size={level.ghostSize}
            onClick={handleClick}
            revealed={found}
            wrongId={wrongId}
          />
        ))}

        {/* Message overlay */}
        <AnimatePresence>
          {message && !found && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-sm font-medium px-4 py-1.5 rounded-full pointer-events-none z-20"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Found overlay */}
        <AnimatePresence>
          {found && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="text-center space-y-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Trophy size={40} className="mx-auto text-yellow-400" />
                </motion.div>
                <p className="text-xl font-bold text-white">{message}</p>
                <div className="text-sm text-white/60 space-y-0.5">
                  <p>Waktu: {elapsed.toFixed(1)} detik</p>
                  {wrongCount === 0 && <p className="text-green-400">Tanpa salah!</p>}
                  {wrongCount > 0 && <p>Salah: {wrongCount} kali</p>}
                  {streak >= 3 && (
                    <p className="text-yellow-400 font-medium">
                      🔥 Streak {streak}!
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" size="sm" onClick={handleNext}>
                    <RotateCcw size={14} /> Lagi
                  </Button>
                  {levelIdx < LEVELS.length - 1 && (
                    <Button variant="primary" size="sm" glow onClick={handleLevelUp}>
                      <Zap size={14} /> Level Up
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-white/25 text-center">
        Klik ghost yang kamu rasa adalah Ghosty yang asli.
        {streak >= 5 && " 🔥 Kamu lagi on fire!"}
      </p>
    </div>
  );
}
