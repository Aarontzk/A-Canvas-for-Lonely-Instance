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
  readonly hasGhost: boolean;
}

interface PopParticle {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly angle: number;
  readonly distance: number;
  readonly size: number;
}

interface RippleEffect {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
}

interface GhostSpirit {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly color: string;
  readonly scale: number;
  readonly drift: number; // horizontal drift direction
}

interface BoardConfig {
  readonly label: string;
  readonly rows: number;
  readonly cols: number;
  readonly shape: "square" | "heart" | "circle" | "star";
}

const BOARDS: readonly BoardConfig[] = [
  { label: "Kotak", rows: 6, cols: 6, shape: "square" },
  { label: "Hati", rows: 7, cols: 7, shape: "heart" },
  { label: "Bulat", rows: 7, cols: 7, shape: "circle" },
  { label: "Bintang", rows: 9, cols: 9, shape: "star" },
];

const PALETTES = [
  ["#a78bfa", "#818cf8", "#6366f1", "#c4b5fd", "#8b5cf6", "#7c3aed"],
  ["#f9a8d4", "#f472b6", "#ec4899", "#fda4af", "#fb7185", "#e11d48"],
  ["#67e8f9", "#22d3ee", "#06b6d4", "#a5f3fc", "#38bdf8", "#0ea5e9"],
  ["#86efac", "#4ade80", "#22c55e", "#bbf7d0", "#34d399", "#10b981"],
  ["#fde68a", "#fbbf24", "#f59e0b", "#fcd34d", "#fb923c", "#f97316"],
];

// ── Shape masks ───────────────────────────────────────────
function isInShape(row: number, col: number, rows: number, cols: number, shape: string): boolean {
  const cy = rows / 2;
  const cx = cols / 2;
  const nr = (row - cy + 0.5) / cy;
  const nc = (col - cx + 0.5) / cx;

  switch (shape) {
    case "heart": {
      const x = nc * 1.2;
      const y = -nr * 1.2 + 0.3;
      return (x * x + y * y - 1) ** 3 - x * x * y * y * y <= 0;
    }
    case "circle":
      return Math.sqrt(nr * nr + nc * nc) <= 0.92;
    case "star": {
      const angle = Math.atan2(nr, nc);
      const dist = Math.sqrt(nr * nr + nc * nc);
      const starR = 0.5 + 0.4 * Math.cos(5 * angle);
      return dist <= starR;
    }
    case "square":
    default:
      return true;
  }
}

// ── Layered pop sound ─────────────────────────────────────
function playPopSound(ctx: AudioContext, combo: number) {
  const t = ctx.currentTime;
  const baseFreq = 400 + combo * 40 + Math.random() * 100;

  // Layer 1: sharp attack pop
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.connect(g1);
  g1.connect(ctx.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(baseFreq, t);
  osc1.frequency.exponentialRampToValueAtTime(60, t + 0.06);
  g1.gain.setValueAtTime(0.25, t);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc1.start(t);
  osc1.stop(t + 0.08);

  // Layer 2: bubble burst noise
  const bufSize = ctx.sampleRate * 0.05;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const noise = ctx.createBufferSource();
  const gNoise = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  noise.buffer = buf;
  noise.connect(filter);
  filter.connect(gNoise);
  gNoise.connect(ctx.destination);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(baseFreq * 2, t);
  filter.Q.setValueAtTime(2, t);
  gNoise.gain.setValueAtTime(0.12, t);
  gNoise.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  noise.start(t);
  noise.stop(t + 0.05);

  // Layer 3: resonant "boop" (higher combo = higher pitch)
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.connect(g2);
  g2.connect(ctx.destination);
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(baseFreq * 1.5, t);
  osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.12);
  g2.gain.setValueAtTime(0.08, t + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc2.start(t + 0.01);
  osc2.stop(t + 0.12);
}

function playComboSound(ctx: AudioContext, combo: number) {
  const t = ctx.currentTime;
  // Rising arpeggio based on combo count
  const notes = [523, 659, 784, 988, 1175]; // C5, E5, G5, B5, D6
  const note = notes[Math.min(combo - 3, notes.length - 1)];

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(note, t);
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.start(t);
  osc.stop(t + 0.3);
}

function playAllPoppedSound(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Victory sparkle: rising chord
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t + i * 0.08);
    g.gain.setValueAtTime(0.1, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.5);
    osc.start(t + i * 0.08);
    osc.stop(t + i * 0.08 + 0.5);
  });
}

// ── Particle ID counter ───────────────────────────────────
let particleIdCounter = 0;

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
  const [particles, setParticles] = useState<PopParticle[]>([]);
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [ghosts, setGhosts] = useState<GhostSpirit[]>([]);

  const audioCtx = useRef<AudioContext | null>(null);
  const comboTimer = useRef<ReturnType<typeof setTimeout>>();
  const boardRef = useRef<HTMLDivElement>(null);

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
            hasGhost: Math.random() < 0.25,
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
    setParticles([]);
    setRipples([]);
    setGhosts([]);
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

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const newParticles: PopParticle[] = Array.from({ length: count }, () => ({
      id: particleIdCounter++,
      x,
      y,
      color,
      angle: Math.random() * Math.PI * 2,
      distance: 20 + Math.random() * 40,
      size: 3 + Math.random() * 5,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 600);
  }, []);

  const spawnRipple = useCallback((x: number, y: number, color: string) => {
    const ripple: RippleEffect = { id: particleIdCounter++, x, y, color };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 500);
  }, []);

  const spawnGhost = useCallback((x: number, y: number, color: string) => {
    const ghost: GhostSpirit = {
      id: particleIdCounter++,
      x,
      y,
      color,
      scale: 0.8 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 40,
    };
    setGhosts(prev => [...prev, ghost]);
    setTimeout(() => {
      setGhosts(prev => prev.filter(g => g.id !== ghost.id));
    }, 1400);
  }, []);

  const popBubble = useCallback((id: number, e: React.MouseEvent | React.TouchEvent) => {
    const bubble = bubbles.find(b => b.id === id);
    if (!bubble || bubble.popped) return;

    setBubbles(prev =>
      prev.map(b => b.id === id ? { ...b, popped: true } : b)
    );
    setPopCount(c => c + 1);

    // Get position for VFX
    const target = e.currentTarget as HTMLElement;
    const boardEl = boardRef.current;
    if (boardEl && target) {
      const boardRect = boardEl.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const cx = targetRect.left - boardRect.left + targetRect.width / 2;
      const cy = targetRect.top - boardRect.top + targetRect.height / 2;

      // Spawn particles
      const now = Date.now();
      const isCombo = now - lastPopTime < 400;
      const pCount = isCombo ? 8 + Math.min(comboCount * 2, 12) : 5;
      spawnParticles(cx, cy, bubble.color, pCount);
      spawnRipple(cx, cy, bubble.color);

      // Ghost spirit flies out of some bubbles
      if (bubble.hasGhost) {
        spawnGhost(cx, cy, bubble.color);
      }
    }

    // Combo tracking
    const now = Date.now();
    const newCombo = now - lastPopTime < 400 ? comboCount + 1 : 1;
    setComboCount(newCombo);
    setLastPopTime(now);

    if (newCombo >= 3) {
      setShowCombo(true);
      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => {
        setShowCombo(false);
        setComboCount(0);
      }, 1200);
    }

    // Sound
    if (soundOn) {
      try {
        const ctx = getAudioCtx();
        playPopSound(ctx, newCombo);
        if (newCombo >= 3) playComboSound(ctx, newCombo);
        // Check if this was the last bubble
        const newPopCount = bubbles.filter(b => b.popped).length + 1;
        if (newPopCount === totalBubbles) {
          setTimeout(() => playAllPoppedSound(ctx), 200);
        }
      } catch {
        // Audio not available
      }
    }
  }, [soundOn, getAudioCtx, lastPopTime, comboCount, bubbles, totalBubbles, spawnParticles, spawnRipple, spawnGhost]);

  const resetBoard = () => initBoard(board, palette);

  const flipBoard = () => {
    // Re-randomize ghost assignment on flip
    setBubbles(prev => prev.map(b => ({ ...b, popped: false, hasGhost: Math.random() < 0.25 })));
    setPopCount(0);
    setComboCount(0);
    setParticles([]);
    setRipples([]);
    setGhosts([]);
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
          {popCount}/{totalBubbles}
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-400 rounded-full"
            animate={{ width: `${totalBubbles > 0 ? (popCount / totalBubbles) * 100 : 0}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <AnimatePresence>
          {showCombo && comboCount >= 3 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-sm font-bold text-yellow-400"
            >
              x{comboCount}!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Pop It Board */}
      <div className="flex justify-center">
        <div
          ref={boardRef}
          className="relative bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-3xl border border-white/10 p-4 sm:p-6 overflow-hidden"
          style={{ maxWidth: 420 }}
        >
          {/* Ripple effects */}
          <AnimatePresence>
            {ripples.map(r => (
              <motion.div
                key={r.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: r.x,
                  top: r.y,
                  transform: "translate(-50%, -50%)",
                  border: `2px solid ${r.color}`,
                }}
                initial={{ width: 10, height: 10, opacity: 0.8 }}
                animate={{ width: 80, height: 80, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          {/* Particle explosions */}
          <AnimatePresence>
            {particles.map(p => (
              <motion.div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          {/* Ghost spirits floating out */}
          <AnimatePresence>
            {ghosts.map(g => (
              <motion.div
                key={g.id}
                className="absolute pointer-events-none z-20"
                style={{
                  left: g.x,
                  top: g.y,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0.3, opacity: 0, y: 0, x: 0 }}
                animate={{
                  scale: [0.3, g.scale, g.scale * 0.8, 0],
                  opacity: [0, 0.9, 0.7, 0],
                  y: [0, -30, -70, -110],
                  x: [0, g.drift * 0.3, g.drift * 0.7, g.drift],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
              >
                <svg viewBox="0 0 44 50" width={32} height={36}>
                  {/* Ghost body */}
                  <path
                    d="M 22 4 C 9 4 5 14 5 25 C 5 35 6 41 9 44 C 11 46 13 45 15 43 C 17 41 19 41 22 43 C 25 41 27 41 29 43 C 31 45 33 46 35 44 C 38 41 39 35 39 25 C 39 14 35 4 22 4 Z"
                    fill={g.color}
                    opacity={0.85}
                  />
                  {/* Ghost shading */}
                  <ellipse cx="22" cy="22" rx="10" ry="12" fill="rgba(255,255,255,0.15)" />
                  {/* Eyes */}
                  <ellipse cx="16" cy="20" rx="2.5" ry="3" fill="rgba(15,23,42,0.7)" />
                  <ellipse cx="28" cy="20" rx="2.5" ry="3" fill="rgba(15,23,42,0.7)" />
                  {/* Mouth — little O */}
                  <ellipse cx="22" cy="28" rx="2.5" ry="2" fill="rgba(15,23,42,0.4)" />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Bubble grid */}
          <div
            className="grid gap-1.5 sm:gap-2 relative z-10"
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
                return <div key={idx} className="w-9 h-9 sm:w-11 sm:h-11" />;
              }

              return (
                <motion.button
                  key={bubble.id}
                  onClick={(e) => popBubble(bubble.id, e)}
                  onTouchStart={(e) => {
                    // Prevent double-fire on touch devices
                    e.preventDefault();
                    popBubble(bubble.id, e);
                  }}
                  className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full focus:outline-none active:outline-none"
                  whileTap={!bubble.popped ? { scale: 0.75 } : {}}
                >
                  {/* Unpopped bubble */}
                  <AnimatePresence>
                    {!bubble.popped && (
                      <motion.div
                        className="absolute inset-0 rounded-full cursor-pointer"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${bubble.color}, ${bubble.color}99)`,
                          boxShadow: `
                            inset 0 -4px 8px rgba(0,0,0,0.35),
                            inset 0 2px 4px rgba(255,255,255,0.25),
                            0 3px 10px ${bubble.color}55
                          `,
                        }}
                        exit={{
                          scale: [1, 1.15, 0.6],
                          opacity: [1, 1, 0],
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {/* Glossy highlight */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            top: "12%",
                            left: "18%",
                            width: "40%",
                            height: "28%",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.05))",
                            borderRadius: "50%",
                          }}
                        />
                        {/* Secondary highlight */}
                        <div
                          className="absolute rounded-full"
                          style={{
                            bottom: "18%",
                            right: "15%",
                            width: "15%",
                            height: "12%",
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "50%",
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Popped hole */}
                  {bubble.popped && (
                    <motion.div
                      className="absolute inset-1.5 rounded-full"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.35), ${bubble.color}15)`,
                        boxShadow: `inset 0 4px 8px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(255,255,255,0.03)`,
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
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl z-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center space-y-3"
                >
                  <p className="text-4xl">🎉</p>
                  <p className="text-lg font-bold text-white">Semua pop!</p>
                  <p className="text-sm text-white/50">Puas? Main lagi?</p>
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
        Pencet cepat-cepat buat combo! 🔥
      </p>
    </div>
  );
}
