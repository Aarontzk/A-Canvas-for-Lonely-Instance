import { getAudioContext, getMasterGain } from "./audioContext";

export interface SoundGenerator {
  start: () => void;
  stop: () => void;
}

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function createWhiteNoise(ctx: AudioContext): SoundGenerator {
  let source: AudioBufferSourceNode | null = null;
  let gainNode: GainNode | null = null;

  const start = () => {
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
    gainNode.connect(getMasterGain());

    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    source.connect(gainNode);
    source.start();
  };

  const stop = () => {
    if (gainNode && source) {
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
      const localSource = source;
      const localGain = gainNode;
      setTimeout(() => {
        try {
          localSource.stop();
          localSource.disconnect();
          localGain.disconnect();
        } catch {
          // Already stopped
        }
      }, 600);
      source = null;
      gainNode = null;
    }
  };

  return { start, stop };
}

export { createNoiseBuffer };
