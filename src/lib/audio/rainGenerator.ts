import { getMasterGain, getAudioContext } from "./audioContext";
import { createNoiseBuffer, type SoundGenerator } from "./whiteNoiseGenerator";

// Bandpass-filtered noise to simulate rain
export function createRainSound(ctx: AudioContext): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];
  let gainNode: GainNode | null = null;
  let filterInterval: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 1);
    gainNode.connect(getMasterGain());

    // Layer 1: main rain texture (bandpass around 800Hz)
    const source1 = ctx.createBufferSource();
    source1.buffer = createNoiseBuffer(ctx);
    source1.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    const gain1 = ctx.createGain();
    gain1.gain.value = 0.7;

    source1.connect(bandpass);
    bandpass.connect(gain1);
    gain1.connect(gainNode);
    source1.start();

    // Layer 2: low rumble (lowpass ~400Hz) for heavy drops
    const source2 = ctx.createBufferSource();
    source2.buffer = createNoiseBuffer(ctx);
    source2.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 400;

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.3;

    source2.connect(lowpass);
    lowpass.connect(gain2);
    gain2.connect(gainNode);
    source2.start();

    sources = [source1, source2];

    // Slightly vary the bandpass frequency for natural variation
    filterInterval = setInterval(() => {
      if (!gainNode) return;
      const newFreq = 700 + Math.random() * 200;
      bandpass.frequency.linearRampToValueAtTime(newFreq, ctx.currentTime + 2);
    }, 2000);
  };

  const stop = () => {
    if (filterInterval) {
      clearInterval(filterInterval);
      filterInterval = null;
    }
    if (gainNode) {
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
      const localSources = [...sources];
      const localGain = gainNode;
      setTimeout(() => {
        localSources.forEach((s) => {
          try {
            s.stop();
            s.disconnect();
          } catch {
            // Already stopped
          }
        });
        try {
          localGain.disconnect();
        } catch {
          // Already disconnected
        }
      }, 1000);
      sources = [];
      gainNode = null;
    }
  };

  return { start, stop };
}
