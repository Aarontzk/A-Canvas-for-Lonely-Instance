let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is not available on the server");
  }
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function getMasterGain(): GainNode {
  getAudioContext(); // ensure context is created
  return masterGain!;
}

export async function resumeAudioContext(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  } catch {
    // Ignore resume errors
  }
}
