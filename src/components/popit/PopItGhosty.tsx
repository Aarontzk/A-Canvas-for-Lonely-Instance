"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

// ── Types ─────────────────────────────────────────────────
interface Bubble {
  readonly id: number;
  readonly row: number;
  readonly col: number;
  readonly color: string;
  readonly popped: boolean;
}

interface BoardConfig {
  readonly label: string;
  readonly rows: number;
  readonly cols: number;
  readonly shape: "square" | "ghost" | "heart" | "circle";
}

const BOARDS: readonly BoardConfig[] = [
  { label: "Ghosty", rows: 8, cols: 6, shape: "ghost" },
  { label: "Hati", rows: 7, cols: 7, shape: "heart" },
  { label: "Kotak", rows: 6, cols: 6, shape: "square" },
  { label: "Bulat", rows: 7, cols: 7, shape: "circle" },
];

// Color palettes
const PALETTES = [
  ["#a78bfa", "#818cf8", "#6366f1", "#c4b5fd", "#8b5cf6", "#7c3aed"], // purple
  ["#f9a8d4", "#f472b6", "#ec4899", "#fda4af", "#fb7185", "#e11d48"], // pink
  ["#67e8f9", "#22d3ee", "#06b6d4", "#a5f3fc", "#38bdf8", "#0ea5e9"], // cyan
  ["#86efac", "#4ade80", "#22c55e", "#bbf7d0", "#34d399", "#10b981"], // green
  ["#fde68a", "#fbbf24", "#f59e0b", "#fcd34d", "#fb923c", "#f97316"], // warm
];

// ── Shape masks ───────────────────────────────────────────
function isInShape(row: number, col: number, rows: number, cols: number, shape: string): boolean {
  const cy = rows / 2;
  const cx = cols / 2;
  const nr = (row - cy + 0.5) / cy; // normalized -1..1
  const nc = (col - cx + 0.5) / cx;

  switch (shape) {
    case "ghost": {
      // Ghost silhouette: round top, wavy bottom
      if (row < rows * 0.15) return false; // top edge
      if (row < rows * 0.55) {
        // Round head
        const dist = Math.sqrt(((col - cx) / (cols * 0.42)) ** 2 + ((row - rows * 0.35) / (rows * 0.35)) ** 2);
        return dist <= 1;
      }
      // Body
      if (col < 0.5 || col >= cols - 0.5) return false;
      // Wavy bottom
      if (row >= rows - 1) {
        return col % 2 === 0;
      }
      return col >= 1 && col < cols - 1;
    }
    case "heart": {
      // Heart shape formula
      const x = nc * 1.2;
      const y = -nr * 1.2 + 0.3;
      const val = (x * x + y * y - 1) ** 3 - x * x * y * y * y;
      return val <= 0;
    }
    case "circle": {
      const dist = Math.sqrt(nr * nr + nc * nc);
      return dist <= 0.92;
    }
    case "square":
    default:
      return true;
  }
}

// ── Pop sound via AudioContext ─────────────────────────────
function playPopSound(ctx: AudioContext, pitch: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(300 + pitch * 200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

// ── Component ─────────────────────────────────────────────
export function PopItGhosty() {
  const [boardIdx, setBoardIdx] = useState(0);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popCount, setPopCount] = useState(0);
  const [totalBubbles, setTotalBubbles] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [lastPopTime, setLastPopTime] = useState(0);

  const audioCtx = useRef<AudioContext | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout>>();

  const board = BOARDS[boardIdx];
  const palette = PALETTES[paletteIdx];

  const initBoard = useCallback((config: BoardConfig, colors: readonly string[]) => {
    const newBubbles: Bubble[] = [];
    let count = 0;
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (isInShape(r, c, config.rows, config.cols, config.shape)) {
          newBubbles.push({
            id: r * config.cols + c,
            row: r,
            col: c,
            color: colors[(r + c) % colors.length],
            popped: false,
          });
          count++;
        }
      }
    }
    setBubbles(newBubbles);
    setPopCount(0);
    setTotalBubbles(count);
    setComboCount(0);
    setShowCombo(false);
  }, []);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted) initBoard(board, palette);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new AudioContext();
    }
    return audioCtx.current;
  }, []);

  const popBubble = useCallback((id: number) => {
    setBubbles(prev => {
      const bubble = prev.find(b => b.id === id);
      if (!bubble || bubble.popped) return prev;
      return prev.map(b => b.id === id ? { ...b, popped: true } : b);
    });

    setPopCount(c => c + 1);

    // Combo tracking
    const now = Date.now();
    if (now - lastPopTime < 400) {
      setComboCount(c => c + 1);
      setShowCombo(true);
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => {
        setShowCombo(false);
        setComboCount(0);
      }, 1200);
    } else {
      setComboCount(1);
    }
    setLastPopTime(now);

    // Sound
    if (soundOn) {
      try {
        const ctx = getAudioCtx();
        playPopSound(ctx, Math.random());
      } catch {
        // Audio not available
      }
    }
  }, [soundOn, getAudioCtx, lastPopTime]);

  const resetBoard = () => {
    initBoard(board, palette);
  };

  const flipBoard = () => {
    // "Flip" — unflip all popped bubbles
    setBubbles(prev => prev.map(b => ({ ...b, popped: false })));
    setPopCount(0);
    setComboCount(0);
  };

  const changePalette = () => {
    const next = (paletteIdx + 1) % PALETTES.length;
    setPaletteIdx(next);
    initBoard(board, PALETTES[next]);
  };

  const changeBoard = (idx: number) => {
    setBoardIdx(idx);
    initBoard(BOARDS[idx], palette);
  };

  const allPopped = popCount === totalBubbles && totalBubbles > 0;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Shape selector */}
        <div className="flex items-center gap-1.5">
          {BOARDS.map((b, i) => (
            <button
              key={b.label}
              onClick={() => changeBoard(i)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                boardIdx === i
                  ? "bg-purple-500/20 border-purple-400/50 text-purple-300"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSoundOn(v => !v)}>
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </Button>
          <Button variant="ghost" size="sm" onClick={changePalette}>
            🎨
          </Button>
          <Button variant="secondary" size="sm" onClick={resetBoard}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/50">
          {popCount}/{totalBubbles} popped
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-400 rounded-full"
            animate={{ width: `${totalBubbles > 0 ? (popCount / totalBubbles) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        {/* Combo indicator */}
        <AnimatePresence>
          {showCombo && comboCount >= 3 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-xs font-bold text-yellow-400"
            >
              x{comboCount} COMBO!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Pop It Board */}
      <div className="flex justify-center">
        <div
          className="relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-3xl border border-white/10 p-4 sm:p-6"
          style={{ maxWidth: 400 }}
        >
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{
              gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
              gridTemplateRows: `repeat(${board.rows}, 1fr)`,
            }}
          >
            {Array.from({ length: board.rows * board.cols }).map((_, idx) => {
              const row = Math.floor(idx / board.cols);
              const col = idx % board.cols;
              const bubble = bubbles.find(b => b.row === row && b.col === col);

              if (!bubble) {
                // Empty cell (not part of shape)
                return <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10" />;
              }

              return (
                <motion.button
                  key={bubble.id}
                  onClick={() => popBubble(bubble.id)}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full focus:outline-none"
                  whileTap={!bubble.popped ? { scale: 0.8 } : {}}
                  style={{ perspective: 200 }}
                >
                  {/* Unpopped state */}
                  <AnimatePresence>
                    {!bubble.popped && (
                      <motion.div
                        className="absolute inset-0 rounded-full cursor-pointer"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${bubble.color}dd, ${bubble.color}88)`,
                          boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2), 0 2px 8px ${bubble.color}44`,
                        }}
                        exit={{
                          scale: 0.7,
                          opacity: 0,
                          rotateX: 180,
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Highlight */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            top: "15%",
                            left: "20%",
                            width: "35%",
                            height: "25%",
                            background: "rgba(255,255,255,0.35)",
                            borderRadius: "50%",
                            filter: "blur(1px)",
                          }}
                        />
                        {/* Mini ghost face on some bubbles */}
                        {(bubble.row + bubble.col) % 4 === 0 && (
                          <svg
                            viewBox="0 0 24 24"
                            className="absolute inset-0 w-full h-full p-1.5 sm:p-2 opacity-30"
                          >
                            <circle cx="9" cy="10" r="1.5" fill="rgba(0,0,0,0.6)" />
                            <circle cx="15" cy="10" r="1.5" fill="rgba(0,0,0,0.6)" />
                            <path d="M 9 15 Q 12 17 15 15" stroke="rgba(0,0,0,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Popped state (depressed hole) */}
                  {bubble.popped && (
                    <div
                      className="absolute inset-1 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.3), ${bubble.color}22)`,
                        boxShadow: `inset 0 3px 6px rgba(0,0,0,0.4), inset 0 -1px 3px rgba(255,255,255,0.05)`,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* All popped overlay */}
          <AnimatePresence>
            {allPopped && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center space-y-3"
                >
                  <p className="text-4xl">🎉</p>
                  <p className="text-lg font-bold text-white">Semua tertekan!</p>
                  <p className="text-sm text-white/50">Satisfying, kan?</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="secondary" size="sm" onClick={flipBoard}>
                      <RotateCcw size={14} /> Balik
                    </Button>
                    <Button variant="primary" size="sm" glow onClick={changePalette}>
                      🎨 Warna Baru
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-white/25 text-center">
        Tekan gelembung-gelembung untuk merasakan pop yang memuaskan ~
      </p>
    </div>
  );
}
