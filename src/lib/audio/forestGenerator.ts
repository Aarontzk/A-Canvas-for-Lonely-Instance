import { getMasterGain } from "./audioContext";
import { createNoiseBuffer, type SoundGenerator } from "./whiteNoiseGenerator";

export function createForestSound(ctx: AudioContext): SoundGenerator {
  let sources: AudioBufferSourceNode[] = [];
  let oscillators: OscillatorNode[] = [];
  let gainNode: GainNode | null = null;
  let birdInterval: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.5);
    gainNode.connect(getMasterGain());

    // === Wind base (lowpass noise + slow LFO on gain) ===
    const windSource = ctx.createBufferSource();
    windSource.buffer = createNoiseBuffer(ctx);
    windSource.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 350;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.5;

    // LFO to modulate wind volume (slow swell)
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08; // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain);
    lfoGain.connect(windGain.gain);
    lfo.start();

    windSource.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(gainNode);
    windSource.start();

    // === Rustling leaves (highpass noise) ===
    const leafSource = ctx.createBufferSource();
    leafSource.buffer = createNoiseBuffer(ctx);
    leafSource.loop = true;

    const leafFilter = ctx.createBiquadFilter();
    leafFilter.type = "highpass";
    leafFilter.frequency.value = 2500;

    const leafGain = ctx.createGain();
    leafGain.gain.value = 0.15;

    leafSource.connect(leafFilter);
    leafFilter.connect(leafGain);
    leafGain.connect(gainNode);
    leafSource.start();

    sources = [windSource, leafSource];
    oscillators = [lfo];

    // === Occasional bird chirps ===
    const triggerBirdChirp = () => {
      if (!gainNode) return;
      const now = ctx.currentTime;
      const bird = ctx.createOscillator();
      bird.type = "sine";
      bird.frequency.setValueAtTime(2200 + Math.random() * 800, now);
      bird.frequency.linearRampToValueAtTime(3000 + Math.random() * 500, now + 0.15);
      bird.frequency.linearRampToValueAtTime(2000, now + 0.3);

      const birdGain = ctx.createGain();
      birdGain.gain.setValueAtTime(0, now);
      birdGain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      birdGain.gain.linearRampToValueAtTime(0, now + 0.3);

      bird.connect(birdGain);
      birdGain.connect(gainNode);
      bird.start(now);
      bird.stop(now + 0.35);
    };

    const scheduleBird = () => {
      const delay = 6000 + Math.random() * 10000; // 6-16 seconds
      birdInterval = setTimeout(() => {
        triggerBirdChirp();
        scheduleBird();
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };
    scheduleBird();
  };

  const stop = () => {
    if (birdInterval) {
      clearTimeout(birdInterval as unknown as ReturnType<typeof setTimeout>);
      birdInterval = null;
    }
    oscillators.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        // Already stopped
      }
    });
    if (gainNode) {
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 1);
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
      }, 1200);
      sources = [];
      gainNode = null;
    }
    oscillators = [];
  };

  return { start, stop };
}
