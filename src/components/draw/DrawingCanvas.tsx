"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Undo2, Redo2, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";
import type { BrushType } from "./BrushSelector";
import { BrushSelector } from "./BrushSelector";
import { ColorPalette } from "./ColorPalette";
import { Button } from "@/components/ui/Button";

interface DrawingCanvasProps {
  onSave: (canvas: HTMLCanvasElement) => void;
}

const MAX_HISTORY = 30;

function applyBrush(
  ctx: CanvasRenderingContext2D,
  brush: BrushType,
  x: number,
  y: number,
  prevX: number,
  prevY: number,
  color: string,
  size: number
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (brush === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = size * 3;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  ctx.globalCompositeOperation = "source-over";

  if (brush === "pen") {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (brush === "crayon") {
    // Multiple slightly offset strokes with varying opacity = crayon texture
    ctx.lineWidth = size * 0.8;
    for (let i = 0; i < 4; i++) {
      const ox = (Math.random() - 0.5) * size * 0.8;
      const oy = (Math.random() - 0.5) * size * 0.8;
      ctx.globalAlpha = 0.25 + Math.random() * 0.3;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(prevX + ox, prevY + oy);
      ctx.lineTo(x + ox, y + oy);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else if (brush === "spray") {
    // Random dots around cursor = spray paint
    ctx.fillStyle = color;
    const radius = size * 4;
    const dots = Math.floor(size * 3);
    for (let i = 0; i < dots; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      const sx = x + Math.cos(angle) * r;
      const sy = y + Math.sin(angle) * r;
      ctx.globalAlpha = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export function DrawingCanvas({ onSave }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  const [brush, setBrush] = useState<BrushType>("pen");
  const [color, setColor] = useState("#00d4ff");
  const [size, setSize] = useState(4);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize canvas with dark background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Truncate redo history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snapshot);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0a0e1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveSnapshot();
  }, [saveSnapshot]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      applyBrush(ctx, brush, pos.x, pos.y, lastPos.current.x, lastPos.current.y, color, size);
      lastPos.current = pos;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [brush, color, size]
  );

  const stopDraw = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveSnapshot();
    }
  }, [saveSnapshot]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
        <BrushSelector value={brush} onChange={setBrush} />
        <ColorPalette value={color} onChange={setColor} />

        {/* Size */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-xs text-white/40 font-medium">Size</p>
            <span className="text-xs text-white/30">{size}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #00d4ff ${((size - 1) / 29) * 100}%, rgba(255,255,255,0.1) ${((size - 1) / 29) * 100}%)`,
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
            <Undo2 size={14} /> Undo
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
            <Redo2 size={14} /> Redo
          </Button>
          <Button variant="ghost" size="sm" onClick={clearCanvas}>
            <Trash2 size={14} /> Clear
          </Button>
          <Button
            variant="primary"
            size="sm"
            glow
            onClick={() => canvasRef.current && onSave(canvasRef.current)}
          >
            <Save size={14} /> Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ cursor: brush === "eraser" ? "cell" : "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: "60vh", minHeight: 320, display: "block" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={(e) => { e.preventDefault(); startDraw(e); }}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={stopDraw}
        />
      </motion.div>
    </div>
  );
}
