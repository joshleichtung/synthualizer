'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  logarithmic?: boolean;
}

/**
 * Rotary knob control - more compact than sliders
 * Drag vertically to adjust value
 */
export function Knob({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  logarithmic = false,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Convert value to rotation angle (-135° to +135° = 270° total)
  const valueToAngle = (val: number): number => {
    const normalized = (val - min) / (max - min);
    return normalized * 270 - 135;
  };

  // Convert rotation angle back to value
  const angleToValue = (angle: number): number => {
    const normalized = (angle + 135) / 270;
    let val = min + normalized * (max - min);

    // Round to step
    val = Math.round(val / step) * step;

    // Clamp to range
    return Math.max(min, Math.min(max, val));
  };

  // Format display value
  const formatValue = (val: number): string => {
    if (logarithmic && unit === 'Hz') {
      // Format frequency nicely
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return Math.round(val).toString();
    }

    if (val < 1) {
      return val.toFixed(2);
    } else if (val < 10) {
      return val.toFixed(1);
    }
    return Math.round(val).toString();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = value;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY.current - e.clientY; // Inverted: up = increase
      const sensitivity = 0.5; // Adjust sensitivity
      const range = max - min;
      const deltaValue = (deltaY * sensitivity * range) / 100;

      let newValue = startValue.current + deltaValue;
      newValue = Math.max(min, Math.min(max, newValue));
      newValue = Math.round(newValue / step) * step;

      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, step, onChange]);

  const angle = valueToAngle(value);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      <label className="text-xs font-semibold text-gray-700">{label}</label>

      {/* Knob */}
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg cursor-ns-resize select-none ${
          isDragging ? 'ring-2 ring-coral-pink' : ''
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Outer ring */}
        <div className="absolute inset-1 rounded-full border-2 border-gray-600" />

        {/* Indicator line */}
        <motion.div
          className="absolute inset-0 flex items-start justify-center"
          animate={{ rotate: angle }}
          transition={{ type: 'tween', duration: 0.1 }}
        >
          <div className="w-1 h-6 bg-coral-pink rounded-full mt-2" />
        </motion.div>

        {/* Center cap */}
        <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gray-800 border border-gray-600" />
      </div>

      {/* Value display */}
      <div className="text-xs font-mono text-gray-900">
        {formatValue(value)}{unit}
      </div>
    </div>
  );
}
