"use client";

import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";
import { generateId } from "@/lib/utils/idGenerator";

export interface SavedDrawing {
  readonly id: string;
  readonly dataUrl: string;
  readonly thumbnail: string;
  readonly createdAt: string;
  readonly title: string;
}

export function useDrawingGallery() {
  const [drawings, setDrawings] = useLocalStorage<SavedDrawing[]>(
    "drawing-gallery",
    []
  );

  const saveDrawing = useCallback(
    (canvas: HTMLCanvasElement, title?: string) => {
      const dataUrl = canvas.toDataURL("image/png");

      // Create thumbnail at 200px wide
      const thumb = document.createElement("canvas");
      const ratio = canvas.height / canvas.width;
      thumb.width = 200;
      thumb.height = Math.round(200 * ratio);
      const ctx = thumb.getContext("2d")!;
      ctx.drawImage(canvas, 0, 0, thumb.width, thumb.height);
      const thumbnail = thumb.toDataURL("image/jpeg", 0.7);

      const drawing: SavedDrawing = {
        id: generateId(),
        dataUrl,
        thumbnail,
        createdAt: new Date().toISOString(),
        title: title ?? `Drawing ${new Date().toLocaleDateString()}`,
      };

      setDrawings((prev) => [drawing, ...prev]);
      return drawing;
    },
    [setDrawings]
  );

  const deleteDrawing = useCallback(
    (id: string) => {
      setDrawings((prev) => prev.filter((d) => d.id !== id));
    },
    [setDrawings]
  );

  return { drawings, saveDrawing, deleteDrawing };
}
