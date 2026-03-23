// Factory for generating decoy ghosts and the real Ghosty

export interface GhostEntity {
  readonly id: number;
  readonly isReal: boolean;
  readonly bodyColor: string;
  readonly eyes: string;
  readonly mouth: string;
  readonly accessory: "none" | "hat" | "horns" | "bowtie" | "crown" | "bandana";
  readonly bodyPath: string;
  readonly rotation: number; // slight tilt in degrees
  readonly x: number; // % position
  readonly y: number; // % position
  readonly bobDelay: number; // animation offset
}

// The REAL Ghosty's signature look
const REAL_BODY = "M 44 8 C 18 8 10 28 10 50 C 10 70 12 82 18 88 C 22 92 26 90 30 86 C 34 82 38 82 44 86 C 50 82 54 82 58 86 C 62 90 66 92 70 88 C 76 82 78 70 78 50 C 78 28 70 8 44 8 Z";
const REAL_EYES = "M 28 38 Q 32 34 36 38 Q 32 42 28 38 Z M 52 38 Q 56 34 60 38 Q 56 42 52 38 Z";
const REAL_MOUTH = "M 35 54 Q 44 58 53 54";
const REAL_COLOR = "#a5b4fc";

// Decoy body shapes (subtly different from real Ghosty)
const DECOY_BODIES = [
  // Wider bottom
  "M 44 8 C 18 8 8 28 8 50 C 8 72 10 84 16 90 C 20 94 24 92 28 88 C 32 84 38 84 44 88 C 50 84 56 84 60 88 C 64 92 68 94 72 90 C 78 84 80 72 80 50 C 80 28 70 8 44 8 Z",
  // Taller, narrower
  "M 44 4 C 22 4 14 24 14 48 C 14 70 16 84 20 90 C 23 93 26 91 30 87 C 34 83 38 83 44 87 C 50 83 54 83 58 87 C 62 91 65 93 68 90 C 72 84 74 70 74 48 C 74 24 66 4 44 4 Z",
  // Rounder blob
  "M 44 10 C 20 10 10 30 10 48 C 10 66 14 78 20 84 C 26 90 30 88 36 84 C 40 80 44 82 44 86 C 44 82 48 80 52 84 C 58 88 62 90 68 84 C 74 78 78 66 78 48 C 78 30 68 10 44 10 Z",
  // Pointy bottom
  "M 44 8 C 18 8 10 28 10 50 C 10 68 12 80 18 86 C 24 92 28 88 32 82 C 36 76 40 76 44 82 C 48 76 52 76 56 82 C 60 88 64 92 70 86 C 76 80 78 68 78 50 C 78 28 70 8 44 8 Z",
  // Extra wavy
  "M 44 8 C 18 8 10 28 10 50 C 10 70 11 80 16 86 C 20 90 22 88 26 84 C 30 80 33 80 36 84 C 39 88 41 88 44 84 C 47 88 49 88 52 84 C 55 80 58 80 62 84 C 66 88 68 90 72 86 C 77 80 78 70 78 50 C 78 28 70 8 44 8 Z",
];

// Decoy eye styles
const DECOY_EYES = [
  // X eyes
  "M 28 34 L 36 42 M 36 34 L 28 42 M 52 34 L 60 42 M 60 34 L 52 42",
  // Dot eyes
  "M 32 38 A 2 2 0 1 1 32 38.01 Z M 56 38 A 2 2 0 1 1 56 38.01 Z",
  // Angry slant
  "M 26 34 L 38 40 Q 32 44 26 40 Z M 62 34 L 50 40 Q 56 44 62 40 Z",
  // Big round eyes
  "M 27 38 A 6 6 0 1 0 39 38 A 6 6 0 1 0 27 38 Z M 49 38 A 6 6 0 1 0 61 38 A 6 6 0 1 0 49 38 Z",
  // Sleepy drooping
  "M 28 40 Q 32 38 36 40 Q 36 42 28 42 Z M 52 40 Q 56 38 60 40 Q 60 42 52 42 Z",
  // Spiral eyes (single circle + dot)
  "M 32 38 A 4 4 0 1 0 32 38.01 M 31 38 A 1 1 0 1 0 31 38.01 Z M 56 38 A 4 4 0 1 0 56 38.01 M 55 38 A 1 1 0 1 0 55 38.01 Z",
  // Upside-down happy (sad)
  "M 28 42 Q 32 36 36 42 Q 32 44 28 42 Z M 52 42 Q 56 36 60 42 Q 56 44 52 42 Z",
  // Star eyes
  "M 32 34 L 34 37 L 37 37 L 35 39 L 36 42 L 32 40 L 28 42 L 29 39 L 27 37 L 30 37 Z M 56 34 L 58 37 L 61 37 L 59 39 L 60 42 L 56 40 L 52 42 L 53 39 L 51 37 L 54 37 Z",
];

// Decoy mouth styles
const DECOY_MOUTHS = [
  "M 33 56 Q 44 50 55 56", // frown
  "M 33 56 Q 40 52 44 54 Q 48 52 55 56", // zigzag
  "M 36 54 Q 44 62 52 54", // big smile
  "M 34 54 Q 38 58 42 54 Q 46 50 50 54", // wavy
  "M 38 54 L 50 54", // flat line
  "M 39 52 Q 39 58 44 58 Q 49 58 49 52", // O mouth
  "M 35 56 Q 44 54 53 56", // barely curved
  "M 33 52 Q 38 58 44 56 Q 50 58 55 52", // W shape
];

// Decoy colors — none should match the real Ghosty's #a5b4fc
const DECOY_COLORS = [
  "#fca5a5", "#fde68a", "#6ee7b7", "#94a3b8", "#fdba74",
  "#f9a8d4", "#d8b4fe", "#93c5fd", "#86efac", "#fbbf24",
  "#fb923c", "#a78bfa", "#67e8f9", "#f472b6", "#c084fc",
  "#4ade80", "#facc15", "#fb7185", "#38bdf8", "#e879f9",
];

type Accessory = GhostEntity["accessory"];
const ACCESSORIES: Accessory[] = ["none", "none", "none", "hat", "horns", "bowtie", "crown", "bandana"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface LevelConfig {
  readonly level: number;
  readonly count: number; // total ghosts including the real one
  readonly ghostSize: number; // px size of each ghost
  readonly label: string;
}

export const LEVELS: readonly LevelConfig[] = [
  { level: 1, count: 6, ghostSize: 70, label: "Mudah" },
  { level: 2, count: 12, ghostSize: 58, label: "Sedang" },
  { level: 3, count: 20, ghostSize: 48, label: "Sulit" },
  { level: 4, count: 30, ghostSize: 42, label: "Sangat Sulit" },
  { level: 5, count: 42, ghostSize: 36, label: "Mustahil?!" },
];

/** Generate a field of ghosts for a given level. Exactly one is real. */
export function generateGhosts(config: LevelConfig): readonly GhostEntity[] {
  const { count, ghostSize } = config;
  const ghosts: GhostEntity[] = [];

  // Calculate grid layout
  const cols = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / cols);
  const cellW = 100 / cols;
  const cellH = 100 / rows;

  // Distribute positions in a jittered grid
  const positions: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (positions.length >= count) break;
      const jitterX = (Math.random() - 0.5) * cellW * 0.4;
      const jitterY = (Math.random() - 0.5) * cellH * 0.3;
      positions.push({
        x: Math.max(2, Math.min(88, c * cellW + cellW / 2 + jitterX)),
        y: Math.max(2, Math.min(88, r * cellH + cellH / 2 + jitterY)),
      });
    }
  }

  const shuffledPositions = shuffle(positions).slice(0, count);

  // The real Ghosty
  const realIdx = Math.floor(Math.random() * count);

  for (let i = 0; i < count; i++) {
    const pos = shuffledPositions[i];
    if (i === realIdx) {
      ghosts.push({
        id: i,
        isReal: true,
        bodyColor: REAL_COLOR,
        eyes: REAL_EYES,
        mouth: REAL_MOUTH,
        accessory: "none",
        bodyPath: REAL_BODY,
        rotation: (Math.random() - 0.5) * 6,
        x: pos.x,
        y: pos.y,
        bobDelay: Math.random() * 3,
      });
    } else {
      // Ensure decoy color is not too close to real
      let color = pick(DECOY_COLORS);
      // Small chance of using a close color to make it harder
      if (Math.random() > 0.85) color = "#b4bffc"; // slightly different indigo

      ghosts.push({
        id: i,
        isReal: false,
        bodyColor: color,
        eyes: pick(DECOY_EYES),
        mouth: pick(DECOY_MOUTHS),
        accessory: pick(ACCESSORIES),
        bodyPath: pick(DECOY_BODIES),
        rotation: (Math.random() - 0.5) * 15,
        x: pos.x,
        y: pos.y,
        bobDelay: Math.random() * 3,
      });
    }
  }

  return ghosts;
}
