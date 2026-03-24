"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Eye, EyeOff, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import {
  generatePieces,
  buildPiecePath,
  drawPuzzleImage,
  type PuzzlePiece,
} from "./puzzleUtils";

const DIFFICULTIES = [
  { label: "Easy", cols: 2, rows: 2 },
  { label: "Medium", cols: 3, rows: 3 },
  { label: "Hard", cols: 4, rows: 4 },
];
const DEFAULT_DIFF = 1; // Medium (3x3)
const SNAP_THRESHOLD = 60; // px — much more forgiving

interface PieceCanvasMap {
  [id: number]: HTMLCanvasElement;
}

export function JigsawPuzzle() {
  const boardRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const pieceCanvasMap = useRef<PieceCanvasMap>({});

  const [diffIdx, setDiffIdx] = useState(DEFAULT_DIFF);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [cellW, setCellW] = useState(0);
  const [cellH, setCellH] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [tabPad, setTabPad] = useState(0);
  const [mounted, setMounted] = useState(false);

  const dragInfo = useRef<{
    id: number;
    startX: number;
    startY: number;
    pieceStartX: number;
    pieceStartY: number;
  } | null>(null);

  const { cols, rows } = DIFFICULTIES[diffIdx];
  const total = cols * rows;

  const initPuzzle = useCallback(
    (c: number, r: number) => {
      const board = boardRef.current;
      const source = sourceCanvasRef.current;
      if (!board || !source) return;

      const bw = board.offsetWidth;
      const bh = Math.round(bw * 0.65);
      board.style.height = `${bh}px`;

      const cw = Math.floor(bw / c);
      const ch = Math.floor(bh / r);
      setCellW(cw);
      setCellH(ch);

      // Dynamic tab padding — must exceed max tab protrusion (0.28 * edge length)
      const tp = Math.ceil(Math.max(cw, ch) * 0.35);
      setTabPad(tp);

      source.width = bw;
      source.height = bh;
      drawPuzzleImage(source);

      // Scatter pieces away from their target — spread around edges
      const newPieces = generatePieces(c, r).map((p, i) => {
        const angle = (i / (c * r)) * Math.PI * 2;
        const rx = (bw / 2) * 0.7;
        const ry = (bh / 2) * 0.7;
        const cx2 = bw / 2 + Math.cos(angle) * rx;
        const cy2 = bh / 2 + Math.sin(angle) * ry;
        return {
          ...p,
          x: Math.max(tp, Math.min(bw - cw - tp, cx2 - cw / 2)),
          y: Math.max(tp, Math.min(bh - ch - tp, cy2 - ch / 2)),
        };
      });
      setPieces(newPieces);
      setSolved(false);
      setShowHint(false);

      // Pre-render piece canvases
      pieceCanvasMap.current = {};
      newPieces.forEach((p) => {
        const pc = document.createElement("canvas");
        const pw = cw + tp * 2;
        const ph = ch + tp * 2;
        pc.width = pw;
        pc.height = ph;
        const ctx = pc.getContext("2d")!;

        buildPiecePath(ctx, p.edges, cw, ch, tp);
        ctx.save();
        ctx.clip();
        ctx.drawImage(source, p.col * cw - tp, p.row * ch - tp, pw, ph, 0, 0, pw, ph);
        ctx.restore();

        // Inner shadow
        buildPiecePath(ctx, p.edges, cw, ch, tp);
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Neon edge
        buildPiecePath(ctx, p.edges, cw, ch, tp);
        ctx.strokeStyle = "rgba(0,212,255,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        pieceCanvasMap.current[p.id] = pc;
      });
    },
    []
  );

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted) initPuzzle(cols, rows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const handleDiffChange = (idx: number) => {
    setDiffIdx(idx);
    initPuzzle(DIFFICULTIES[idx].cols, DIFFICULTIES[idx].rows);
  };

  // ── Drag ──────────────────────────────────────────────
  const startDrag = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: number) => {
      e.preventDefault();
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const piece = pieces.find((p) => p.id === id);
      if (!piece) return;

      dragInfo.current = {
        id,
        startX: clientX - rect.left,
        startY: clientY - rect.top,
        pieceStartX: piece.x,
        pieceStartY: piece.y,
      };

      setPieces((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy.push(copy.splice(idx, 1)[0]);
        return copy;
      });
    },
    [pieces]
  );

  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragInfo.current) return;
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const clientX = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    const dx = clientX - rect.left - dragInfo.current.startX;
    const dy = clientY - rect.top - dragInfo.current.startY;
    const { id, pieceStartX, pieceStartY } = dragInfo.current;

    setPieces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, x: pieceStartX + dx, y: pieceStartY + dy } : p
      )
    );
  }, []);

  const endDrag = useCallback(() => {
    if (!dragInfo.current) return;
    const id = dragInfo.current.id;
    dragInfo.current = null;

    setPieces((prev) => {
      const piece = prev.find((p) => p.id === id);
      if (!piece) return prev;
      const targetX = piece.col * cellW;
      const targetY = piece.row * cellH;
      const dist = Math.hypot(piece.x - targetX, piece.y - targetY);
      return prev.map((p) =>
        p.id === id && dist < SNAP_THRESHOLD
          ? { ...p, x: targetX, y: targetY, placed: true }
          : p
      );
    });
  }, [cellW, cellH]);

  // Detect win
  useEffect(() => {
    if (pieces.length > 0 && pieces.every((p) => p.placed)) setSolved(true);
  }, [pieces]);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, [onDrag, endDrag]);

  const placedCount = pieces.filter((p) => p.placed).length;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.label}
              onClick={() => handleDiffChange(i)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium border transition-all",
                diffIdx === i
                  ? "bg-neon-blue/20 border-neon-blue/50 text-neon-blue"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
              )}
            >
              {d.label}
              <span className="ml-1 opacity-50">
                {d.cols}×{d.rows}
              </span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHint((v) => !v)}
            className={showHint ? "text-yellow-400 border-yellow-400/30" : ""}
          >
            <Lightbulb size={14} />
            Hint
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? "Hide" : "Preview"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => initPuzzle(cols, rows)}>
            <RefreshCw size={14} /> New
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/50">
          {placedCount}/{total} placed
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-neon-blue rounded-full"
            animate={{ width: `${(placedCount / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>
        <span className="text-xs text-white/30">
          {Math.round((placedCount / total) * 100)}%
        </span>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden border border-white/10"
          >
            <canvas ref={sourceCanvasRef} className="w-full" style={{ display: "block" }} />
          </motion.div>
        )}
      </AnimatePresence>
      {!showPreview && <canvas ref={sourceCanvasRef} className="hidden" />}

      {/* Board */}
      <div
        ref={boardRef}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-navy-900/80 select-none"
        style={{ width: "100%", minHeight: 260 }}
      >
        {/* Grid guide */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${cellW}px ${cellH}px`,
          }}
        />

        {/* Target slots — glow when hint is active */}
        {pieces.map((p) => (
          <motion.div
            key={`target-${p.id}`}
            className="absolute rounded-sm border"
            animate={
              showHint && !p.placed
                ? {
                    borderColor: ["rgba(0,212,255,0.2)", "rgba(0,212,255,0.7)", "rgba(0,212,255,0.2)"],
                    boxShadow: [
                      "0 0 0 rgba(0,212,255,0)",
                      "0 0 12px rgba(0,212,255,0.4)",
                      "0 0 0 rgba(0,212,255,0)",
                    ],
                  }
                : { borderColor: "rgba(255,255,255,0.08)", boxShadow: "none" }
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              left: p.col * cellW,
              top: p.row * cellH,
              width: cellW,
              height: cellH,
            }}
          />
        ))}

        {/* Pieces */}
        {pieces.map((p) => {
          const pc = pieceCanvasMap.current[p.id];
          if (!pc) return null;
          return (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: p.x - tabPad,
                top: p.y - tabPad,
                width: cellW + tabPad * 2,
                height: cellH + tabPad * 2,
                cursor: p.placed ? "default" : "grab",
                zIndex: p.placed ? 1 : 10,
                filter: p.placed
                  ? "drop-shadow(0 0 6px rgba(0,212,255,0.3))"
                  : "drop-shadow(0 6px 16px rgba(0,0,0,0.7))",
                transition: "filter 0.3s",
              }}
              onMouseDown={(e) => !p.placed && startDrag(e, p.id)}
              onTouchStart={(e) => !p.placed && startDrag(e, p.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pc.toDataURL()}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            </div>
          );
        })}

        {/* Solved overlay */}
        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="text-center space-y-3"
              >
                <p className="text-5xl">🌟</p>
                <p className="text-xl font-bold text-white">Puzzle Solved!</p>
                <p className="text-sm text-white/60">Beautiful, isn&apos;t it?</p>
                <Button variant="primary" size="sm" glow onClick={() => initPuzzle(cols, rows)}>
                  <RefreshCw size={14} /> Play Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-white/25 text-center">
        Drag pieces near their spot — they&apos;ll snap in automatically.
        {showHint && " 💡 Glowing outlines show where each piece goes."}
      </p>
    </div>
  );
}
