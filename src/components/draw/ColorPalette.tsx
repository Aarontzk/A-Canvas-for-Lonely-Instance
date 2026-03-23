"use client";

import { cn } from "@/lib/utils/cn";

const PRESET_COLORS = [
  "#ffffff", "#94a3b8", "#64748b", "#1e293b", "#000000",
  "#00d4ff", "#b44dff", "#ff2d8a", "#facc15", "#34d399",
  "#f87171", "#fb923c", "#a78bfa", "#60a5fa", "#2dd4bf",
];

interface ColorPaletteProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPalette({ value, onChange }: ColorPaletteProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-white/40 font-medium">Color</p>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-150",
              value === color
                ? "border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                : "border-transparent hover:scale-105"
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        ))}
        {/* Custom color */}
        <label className="w-6 h-6 rounded-full border-2 border-dashed border-white/30 hover:border-white/60 transition-colors cursor-pointer flex items-center justify-center overflow-hidden">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute w-1 h-1"
          />
          <span className="text-[10px] text-white/40">+</span>
        </label>
      </div>
    </div>
  );
}
