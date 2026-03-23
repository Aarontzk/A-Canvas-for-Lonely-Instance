"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { DrawingCanvas } from "@/components/draw/DrawingCanvas";
import { DrawingGallery } from "@/components/draw/DrawingGallery";
import { useDrawingGallery } from "@/hooks/useDrawingGallery";
import { ToastList } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function DrawPage() {
  const { drawings, saveDrawing, deleteDrawing } = useDrawingGallery();
  const { toasts, addToast, removeToast } = useToast();
  const [saveCount, setSaveCount] = useState(0);

  const handleSave = (canvas: HTMLCanvasElement) => {
    saveDrawing(canvas, `Canvas #${drawings.length + 1}`);
    setSaveCount((n) => n + 1);
    addToast("Drawing saved to gallery ✨", "success");
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Drawing Canvas</h1>
          <p className="text-sm text-white/40 mt-1">
            Let your hands speak what words can&apos;t.
          </p>
        </div>

        {/* Re-mount canvas on each save so it stays fresh */}
        <DrawingCanvas key={saveCount} onSave={handleSave} />

        {drawings.length > 0 && (
          <DrawingGallery drawings={drawings} onDelete={deleteDrawing} />
        )}
      </div>
      <ToastList toasts={toasts} onRemove={removeToast} />
    </PageTransition>
  );
}
