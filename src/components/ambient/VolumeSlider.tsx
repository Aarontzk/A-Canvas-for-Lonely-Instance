"use client";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] text-white/40">Vol</span>
      <div className="relative flex-1">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/10"
          style={{
            background: `linear-gradient(to right, #00d4ff ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%)`,
          }}
          aria-label="Volume"
        />
      </div>
      <span className="text-[10px] text-white/40 w-7 text-right">
        {Math.round(value * 100)}
      </span>
    </div>
  );
}
