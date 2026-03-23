import type { Mood } from "@/types/journal";

export interface GhostExpression {
  readonly eyes: string; // SVG path d attribute
  readonly mouth: string; // SVG path d attribute
  readonly bodyColor: string;
  readonly auraColor: string;
}

export type GhostMood = Mood | "idle" | "annoyed" | "surprised" | "love";

// All eye/mouth paths use consistent structure for smooth morphing
export const GHOST_EXPRESSIONS: Record<GhostMood, GhostExpression> = {
  idle: {
    // Eyes: two small ovals
    eyes: "M 28 38 Q 32 34 36 38 Q 32 42 28 38 Z M 52 38 Q 56 34 60 38 Q 56 42 52 38 Z",
    mouth: "M 35 54 Q 44 58 53 54",
    bodyColor: "#a5b4fc",
    auraColor: "rgba(0, 212, 255, 0.4)",
  },
  happy: {
    // Eyes: curved up (happy ^_^)
    eyes: "M 28 40 Q 32 34 36 40 Q 32 44 28 40 Z M 52 40 Q 56 34 60 40 Q 56 44 52 40 Z",
    mouth: "M 33 52 Q 44 62 55 52",
    bodyColor: "#fde68a",
    auraColor: "rgba(250, 204, 21, 0.5)",
  },
  sad: {
    // Eyes: droopy downcast
    eyes: "M 28 36 Q 32 42 36 36 Q 32 32 28 36 Z M 52 36 Q 56 42 60 36 Q 56 32 52 36 Z",
    mouth: "M 33 58 Q 44 50 55 58",
    bodyColor: "#93c5fd",
    auraColor: "rgba(96, 165, 250, 0.5)",
  },
  angry: {
    // Eyes: angled V-shape (furrowed brow)
    eyes: "M 28 38 Q 32 32 36 36 Q 32 42 28 38 Z M 52 36 Q 56 32 60 38 Q 56 42 52 36 Z",
    mouth: "M 33 56 Q 40 52 44 54 Q 48 52 55 56",
    bodyColor: "#fca5a5",
    auraColor: "rgba(248, 113, 113, 0.5)",
  },
  anxious: {
    // Eyes: wide open circles
    eyes: "M 26 38 Q 32 30 38 38 Q 32 46 26 38 Z M 50 38 Q 56 30 62 38 Q 56 46 50 38 Z",
    mouth: "M 34 54 Q 38 58 42 54 Q 46 50 50 54 Q 54 58 55 54",
    bodyColor: "#d8b4fe",
    auraColor: "rgba(192, 132, 252, 0.5)",
  },
  calm: {
    // Eyes: gentle closed (soft curves)
    eyes: "M 28 40 Q 32 36 36 40 Q 32 40 28 40 Z M 52 40 Q 56 36 60 40 Q 56 40 52 40 Z",
    mouth: "M 35 53 Q 44 57 53 53",
    bodyColor: "#6ee7b7",
    auraColor: "rgba(52, 211, 153, 0.5)",
  },
  tired: {
    // Eyes: half-closed (lower lids raised)
    eyes: "M 28 40 Q 32 34 36 40 Q 36 44 28 44 Q 28 40 28 40 Z M 52 40 Q 56 34 60 40 Q 60 44 52 44 Q 52 40 52 40 Z",
    mouth: "M 35 55 Q 44 57 53 55",
    bodyColor: "#94a3b8",
    auraColor: "rgba(148, 163, 184, 0.4)",
  },
  hopeful: {
    // Eyes: star-like sparkle (diamond shape)
    eyes: "M 32 34 L 36 38 L 32 42 L 28 38 Z M 56 34 L 60 38 L 56 42 L 52 38 Z",
    mouth: "M 34 52 Q 44 60 54 52",
    bodyColor: "#fdba74",
    auraColor: "rgba(251, 146, 60, 0.5)",
  },
  annoyed: {
    // Eyes: flat annoyed (half-closed + furrowed)
    eyes: "M 27 38 Q 32 34 37 38 Q 37 40 27 40 Z M 51 38 Q 56 34 61 38 Q 61 40 51 40 Z",
    mouth: "M 35 56 Q 40 52 44 56 Q 48 52 53 56",
    bodyColor: "#f9a8d4",
    auraColor: "rgba(244, 114, 182, 0.5)",
  },
  surprised: {
    // Eyes: wide circles
    eyes: "M 26 38 Q 32 30 38 38 Q 32 46 26 38 Z M 50 38 Q 56 30 62 38 Q 56 46 50 38 Z",
    mouth: "M 39 54 Q 39 60 44 60 Q 49 60 49 54 Q 49 60 44 60 Q 39 60 39 54 Z",
    bodyColor: "#c4b5fd",
    auraColor: "rgba(167, 139, 250, 0.5)",
  },
  love: {
    // Eyes: heart-like (curved up with sparkle)
    eyes: "M 28 40 Q 30 34 32 36 Q 34 34 36 40 Q 32 44 28 40 Z M 52 40 Q 54 34 56 36 Q 58 34 60 40 Q 56 44 52 40 Z",
    mouth: "M 33 52 Q 44 64 55 52",
    bodyColor: "#fda4af",
    auraColor: "rgba(251, 113, 133, 0.6)",
  },
};
