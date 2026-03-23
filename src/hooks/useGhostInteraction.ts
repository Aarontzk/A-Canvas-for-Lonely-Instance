"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { GhostMood } from "@/components/mascot/ghostExpressions";

const AMBIENT_MOODS: GhostMood[] = [
  "idle", "calm", "happy", "tired", "hopeful", "idle", "sad", "idle",
];

const MOOD_CYCLE_MS = 25_000; // change mood every 25 s
const ANNOYANCE_THRESHOLD = 5; // taps before annoyed
const ANNOYANCE_DECAY_MS = 6_000; // annoyance resets after 6 s
const REACTION_DURATION_MS = 2_000; // how long a tap reaction lasts

export interface GhostInteraction {
  readonly currentMood: GhostMood;
  readonly isWiggling: boolean;
  readonly tapBurst: number; // 0-1 intensity of recent taps
  readonly dialogueLine: string | null;
  readonly onTap: () => void;
  readonly onHoverStart: () => void;
  readonly onHoverEnd: () => void;
}

const TAP_LINES: Record<string, readonly string[]> = {
  idle: ["Hm?", "Ada apa?", "Hai~"],
  happy: ["Hehe~", "Yay!", "Senangnya!"],
  calm: ["Hmm...", "Damai~", "Tenang..."],
  sad: ["...", "Hmm...", "Sedih..."],
  tired: ["Zzz...", "*nguap*", "Ngantuk..."],
  hopeful: ["Semangat!", "Pasti bisa!", "Ayo!"],
  love: ["<3", "Uwu~", "Suka!"],
  surprised: ["Hah?!", "Waduh!", "Kaget!"],
  annoyed: ["Udah dong!", "Jangan terus!", "Hmmph!", "Berhenti!", "Ish!"],
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useGhostInteraction(
  baseMood: GhostMood | null = null
): GhostInteraction {
  const [ambientMood, setAmbientMood] = useState<GhostMood>("idle");
  const [reactionMood, setReactionMood] = useState<GhostMood | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);
  const [dialogueLine, setDialogueLine] = useState<string | null>(null);

  const tapCount = useRef(0);
  const tapDecayTimer = useRef<ReturnType<typeof setTimeout>>();
  const reactionTimer = useRef<ReturnType<typeof setTimeout>>();
  const dialogueTimer = useRef<ReturnType<typeof setTimeout>>();

  // Ambient mood cycling (only when no base mood is forced)
  useEffect(() => {
    if (baseMood) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % AMBIENT_MOODS.length;
      setAmbientMood(AMBIENT_MOODS[idx]);
    }, MOOD_CYCLE_MS);
    return () => clearInterval(interval);
  }, [baseMood]);

  const clearTimers = useCallback(() => {
    if (reactionTimer.current) clearTimeout(reactionTimer.current);
    if (dialogueTimer.current) clearTimeout(dialogueTimer.current);
  }, []);

  const onTap = useCallback(() => {
    tapCount.current += 1;
    if (tapDecayTimer.current) clearTimeout(tapDecayTimer.current);
    tapDecayTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, ANNOYANCE_DECAY_MS);

    clearTimers();

    let mood: GhostMood;
    if (tapCount.current >= ANNOYANCE_THRESHOLD) {
      mood = "annoyed";
    } else if (tapCount.current >= 3) {
      mood = "surprised";
    } else {
      mood = Math.random() > 0.5 ? "love" : "surprised";
    }

    setReactionMood(mood);
    setIsWiggling(true);

    const lines = TAP_LINES[mood] ?? TAP_LINES.idle;
    setDialogueLine(pickRandom(lines));

    reactionTimer.current = setTimeout(() => {
      setReactionMood(null);
      setIsWiggling(false);
    }, REACTION_DURATION_MS);

    dialogueTimer.current = setTimeout(() => {
      setDialogueLine(null);
    }, REACTION_DURATION_MS + 500);
  }, [clearTimers]);

  const onHoverStart = useCallback(() => {
    setIsWiggling(true);
    if (!reactionMood && !dialogueLine) {
      const activeMood = baseMood ?? ambientMood;
      const lines = TAP_LINES[activeMood] ?? TAP_LINES.idle;
      setDialogueLine(pickRandom(lines));
    }
  }, [reactionMood, dialogueLine, baseMood, ambientMood]);

  const onHoverEnd = useCallback(() => {
    if (!reactionMood) {
      setIsWiggling(false);
      setDialogueLine(null);
    }
  }, [reactionMood]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (tapDecayTimer.current) clearTimeout(tapDecayTimer.current);
    clearTimers();
  }, [clearTimers]);

  const currentMood = reactionMood ?? baseMood ?? ambientMood;

  return {
    currentMood,
    isWiggling,
    tapBurst: Math.min(tapCount.current / ANNOYANCE_THRESHOLD, 1),
    dialogueLine,
    onTap,
    onHoverStart,
    onHoverEnd,
  };
}
