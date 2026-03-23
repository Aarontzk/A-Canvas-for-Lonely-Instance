"use client";

import { useMemo } from "react";
import type { MascotState } from "@/types/journal";
import type { GhostMood } from "@/components/mascot/ghostExpressions";
import { GHOST_EXPRESSIONS } from "@/components/mascot/ghostExpressions";

export function useMascotState(mood: GhostMood | null): MascotState {
  return useMemo(() => {
    const key = mood ?? "idle";
    const expr = GHOST_EXPRESSIONS[key];
    return {
      mood: key,
      expression: key,
      glowColor: expr.auraColor,
      animation: key === "anxious" ? "flicker" : "float",
    };
  }, [mood]);
}
