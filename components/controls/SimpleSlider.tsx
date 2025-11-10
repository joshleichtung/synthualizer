'use client';

import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

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
 * Enhanced slider with smooth animations and visual feedback
 * Features spring physics, directional value animations, and interactive glow effects
 * Optimized for audio parameter control with no performance impact
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
  // Interaction states
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const previousValue = useRef(value);

  // Smooth value animation using spring physics
  const springValue = useSpring(value, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  // Update spring when value changes
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Calculate percentage for visual elements
  const percentage = ((value - min) / (max - min)) * 100;

  // Determine glow color based on position
  const glowColor =
    percentage < 33
      ? 'rgba(255, 127, 127, 0.4)' // coral-pink
      : percentage < 66
      ? 'rgba(200, 100, 200, 0.4)' // blend
      : 'rgba(181, 152, 255, 0.4)'; // purple-soft

  // Detect value change direction for animation
  const valueDirection = value > previousValue.current ? 1 : -1;
  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return (
    <div className="space-y-2">
      {/* Label and animated value display */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>

        {/* Animated value with slide transition */}
        <div className="relative h-5 min-w-[4rem] flex items-center justify-end overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={Math.round(value)} // Re-render on value change
              initial={{
                y: valueDirection * 10,
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: isActive ? 1.05 : 1,
              }}
              exit={{
                y: valueDirection * -10,
                opacity: 0,
                scale: 0.9,
              }}
              transition={{
                duration: 0.15,
                ease: 'easeOut',
              }}
              className={`
                text-sm font-mono text-right absolute right-0
                ${isActive ? 'font-bold text-coral-pink' : 'font-medium text-gray-500'}
              `}
            >
              {Math.round(value)}
              {unit}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Slider track with animations */}
      <motion.div
        className="relative h-2 group"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Background track with subtle shadow */}
        <div
          className={`
          absolute inset-0 bg-gray-200 rounded-full transition-all duration-200
          ${isHovered ? 'shadow-inner' : ''}
        `}
        />

        {/* Filled portion with gradient and glow */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-coral-pink to-purple-soft rounded-full"
          style={{
            width: `${percentage}%`,
            filter: isActive
              ? `drop-shadow(0 0 8px ${glowColor}) brightness(1.1)`
              : 'none',
          }}
          transition={{ duration: 0.1 }}
        />

        {/* Native input (invisible but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          onTouchStart={() => setIsActive(true)}
          onTouchEnd={() => setIsActive(false)}
          className={`
            absolute inset-0 w-full opacity-0 z-10
            ${isActive ? 'cursor-grabbing' : 'cursor-grab'}
          `}
          aria-label={label}
        />

        {/* Animated visual thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full border-2 border-coral-pink shadow-md pointer-events-none"
          style={{
            left: `calc(${percentage}% - 8px)`,
            boxShadow: isActive
              ? `0 0 12px ${glowColor}, 0 4px 6px rgba(0, 0, 0, 0.1)`
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          animate={{
            scale: isActive ? 1.3 : isHovered ? 1.1 : 1,
            width: isActive ? 18 : 16,
            height: isActive ? 18 : 16,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
          }}
        />
      </motion.div>
    </div>
  );
}
