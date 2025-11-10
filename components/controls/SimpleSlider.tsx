'use client';

interface SimpleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

/**
 * Simple slider control with gradient fill
 * Shows current value and supports smooth dragging
 */
export function SimpleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
}: SimpleSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      {/* Label and value display */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-mono text-gray-500 min-w-[4rem] text-right">
          {Math.round(value)}{unit}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-2 group">
        {/* Background track */}
        <div className="absolute inset-0 bg-gray-200 rounded-full" />

        {/* Filled portion with gradient */}
        <div
          className="absolute h-full bg-gradient-to-r from-coral-pink to-purple-soft rounded-full transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />

        {/* Native input (invisible but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          aria-label={label}
        />

        {/* Visual thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-coral-pink shadow-md transition-transform group-hover:scale-110 pointer-events-none"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
