"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download } from "lucide-react";
import type { SavedDrawing } from "@/hooks/useDrawingGallery";
import { formatRelativeDate } from "@/lib/utils/dateFormat";

interface DrawingGalleryProps {
  drawings: SavedDrawing[];
  onDelete: (id: string) => void;
}

export function DrawingGallery({ drawings, onDelete }: DrawingGalleryProps) {
  if (drawings.length === 0) return null;

  const handleDownload = (drawing: SavedDrawing) => {
    const a = document.createElement("a");
    a.href = drawing.dataUrl;
    a.download = `${drawing.title}.png`;
    a.click();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/60">Saved drawings ({drawings.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {drawings.map((drawing) => (
            <motion.div
              key={drawing.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-[4/3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={drawing.thumbnail}
                alt={drawing.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-white/80 text-center px-2 font-medium truncate w-full text-center">
                  {drawing.title}
                </p>
                <p className="text-[10px] text-white/40">
                  {formatRelativeDate(drawing.createdAt)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(drawing)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    aria-label="Download"
                  >
                    <Download size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(drawing.id)}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
