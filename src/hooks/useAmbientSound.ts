"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { AmbientSound, AmbientPlayerState } from "@/types/journal";
import type { SoundGenerator } from "@/lib/audio/whiteNoiseGenerator";

export function useAmbientSound() {
  const [state, setState] = useState<AmbientPlayerState>({
    activeSound: null,
    volume: 0.5,
    isPlaying: false,
  });

  const generatorRef = useRef<SoundGenerator | null>(null);

  const stopCurrent = useCallback(() => {
    if (generatorRef.current) {
      generatorRef.current.stop();
      generatorRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (sound: AmbientSound) => {
      stopCurrent();
      try {
        const { resumeAudioContext, getAudioContext, getMasterGain } =
          await import("@/lib/audio/audioContext");
        await resumeAudioContext();
        const ctx = getAudioContext();
        const masterGain = getMasterGain();
        masterGain.gain.setTargetAtTime(state.volume, ctx.currentTime, 0.1);

        let generator: SoundGenerator;
        if (sound === "rain") {
          const { createRainSound } = await import("@/lib/audio/rainGenerator");
          generator = createRainSound(ctx);
        } else if (sound === "whitenoise") {
          const { createWhiteNoise } = await import(
            "@/lib/audio/whiteNoiseGenerator"
          );
          generator = createWhiteNoise(ctx);
        } else {
          const { createForestSound } = await import(
            "@/lib/audio/forestGenerator"
          );
          generator = createForestSound(ctx);
        }

        generator.start();
        generatorRef.current = generator;
        setState({ activeSound: sound, volume: state.volume, isPlaying: true });
      } catch (err) {
        console.error("Failed to start sound:", err);
      }
    },
    [stopCurrent, state.volume]
  );

  const stop = useCallback(() => {
    stopCurrent();
    setState((prev) => ({ ...prev, activeSound: null, isPlaying: false }));
  }, [stopCurrent]);

  const toggle = useCallback(
    async (sound: AmbientSound) => {
      if (state.activeSound === sound && state.isPlaying) {
        stop();
      } else {
        await play(sound);
      }
    },
    [state.activeSound, state.isPlaying, stop, play]
  );

  const setVolume = useCallback(
    async (volume: number) => {
      setState((prev) => ({ ...prev, volume }));
      try {
        const { getAudioContext, getMasterGain } = await import(
          "@/lib/audio/audioContext"
        );
        const ctx = getAudioContext();
        const masterGain = getMasterGain();
        masterGain.gain.linearRampToValueAtTime(
          volume,
          ctx.currentTime + 0.1
        );
      } catch {
        // Context not yet created
      }
    },
    []
  );

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, [stopCurrent]);

  return { state, play, stop, toggle, setVolume };
}
