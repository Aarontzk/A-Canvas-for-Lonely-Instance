"use client";

import { motion } from "framer-motion";
import type { GhostEntity } from "./ghostFactory";

interface GhostSpriteProps {
  readonly ghost: GhostEntity;
  readonly size: number;
  readonly onClick: (id: number) => void;
  readonly revealed: boolean; // after found — highlight real, dim decoys
  readonly wrongId: number | null; // flash red on wrong pick
}

function AccessoryRender({ type, size }: { type: GhostEntity["accessory"]; size: number }) {
  const s = size / 88; // scale factor (viewBox is 88 wide)
  switch (type) {
    case "hat":
      return (
        <g>
          <rect x={30} y={2} width={28} height={6} rx={2} fill="#2a2a2a" />
          <rect x={34} y={-8} width={20} height={12} rx={3} fill="#2a2a2a" />
          <rect x={36} y={-2} width={16} height={2} rx={1} fill="#e74c3c" />
        </g>
      );
    case "horns":
      return (
        <g>
          <path d="M 26 14 Q 20 -2 18 0 Q 22 6 26 14" fill="#e74c3c" />
          <path d="M 62 14 Q 68 -2 70 0 Q 66 6 62 14" fill="#e74c3c" />
        </g>
      );
    case "bowtie":
      return (
        <g>
          <path d="M 36 62 L 30 56 L 30 68 Z" fill="#e74c3c" />
          <path d="M 52 62 L 58 56 L 58 68 Z" fill="#e74c3c" />
          <circle cx={44} cy={62} r={3} fill="#c0392b" />
        </g>
      );
    case "crown":
      return (
        <path d="M 28 10 L 32 -2 L 38 6 L 44 -4 L 50 6 L 56 -2 L 60 10 Z"
          fill="#ffd700" stroke="#daa520" strokeWidth={1} />
      );
    case "bandana":
      return (
        <g>
          <path d="M 14 30 Q 44 22 74 30 Q 74 36 44 28 Q 14 36 14 30 Z" fill="#e74c3c" />
          <path d="M 72 30 Q 80 34 82 42 Q 78 38 72 36" fill="#e74c3c" />
        </g>
      );
    default:
      return null;
  }
}

export function GhostSprite({ ghost, size, onClick, revealed, wrongId }: GhostSpriteProps) {
  const isWrongPick = wrongId === ghost.id;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${ghost.x}%`,
        top: `${ghost.y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${ghost.rotation}deg)`,
      }}
      animate={
        revealed && ghost.isReal
          ? { scale: [1, 1.3, 1.2], filter: "drop-shadow(0 0 12px rgba(165,180,252,0.8))" }
          : revealed && !ghost.isReal
            ? { opacity: 0.3, scale: 0.9 }
            : isWrongPick
              ? { x: [0, -6, 6, -4, 4, 0], scale: [1, 0.95, 1] }
              : {}
      }
      transition={
        isWrongPick
          ? { duration: 0.4 }
          : { duration: 0.5, ease: "easeOut" }
      }
      whileHover={!revealed ? { scale: 1.15, y: -4 } : {}}
      whileTap={!revealed ? { scale: 0.9 } : {}}
      onClick={() => !revealed && onClick(ghost.id)}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 2.5 + Math.random(),
          repeat: Infinity,
          ease: "easeInOut",
          delay: ghost.bobDelay,
        }}
      >
        <svg viewBox="0 0 88 100" width={size} height={size}>
          {/* Body */}
          <path
            d={ghost.bodyPath}
            fill={isWrongPick ? "#ff4444" : ghost.bodyColor}
            style={{ transition: "fill 0.3s" }}
          />
          {/* Shading */}
          <ellipse cx="44" cy="45" rx="18" ry="22" fill="rgba(255,255,255,0.1)" />
          {/* Eyes */}
          <path
            d={ghost.eyes}
            fill="rgba(15, 23, 42, 0.85)"
            stroke="rgba(15, 23, 42, 0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Mouth */}
          <path
            d={ghost.mouth}
            stroke="rgba(15, 23, 42, 0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Accessory */}
          <AccessoryRender type={ghost.accessory} size={size} />
        </svg>
      </motion.div>
    </motion.div>
  );
}
