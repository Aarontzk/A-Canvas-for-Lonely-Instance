"use client";

import { PageTransition } from "@/components/layout/PageTransition";
import { JigsawPuzzle } from "@/components/puzzle/JigsawPuzzle";

export default function PuzzlePage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Jigsaw Puzzle</h1>
          <p className="text-sm text-white/40 mt-1">
            Piece together a dreamy night sky. Take your time. No rush.
          </p>
        </div>
        <JigsawPuzzle />
      </div>
    </PageTransition>
  );
}
