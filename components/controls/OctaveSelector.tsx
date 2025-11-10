'use client';

import { motion } from 'framer-motion';

interface OctaveSelectorProps {
  value: number;
  onChange: (octave: number) => void;
}

/**
 * Enhanced octave selector control with interactive glow effects
 * Allows switching between octaves 1-6
 * Uses purple-themed glows to differentiate from waveform selector
 */
export function OctaveSelector({ value, onChange }: OctaveSelectorProps) {
  const octaves = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Octave
      </label>
      <div className="flex gap-2">
        {octaves.map((octave) => {
          const isActive = value === octave;

          return (
            <motion.button
              key={octave}
              onClick={() => onChange(octave)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-purple-soft text-white shadow-md shadow-purple-soft/30'
                    : 'bg-gray-100 text-gray-700'
                }
              `}
              style={{
                filter: isActive ? 'drop-shadow(0 0 12px rgba(198, 135, 240, 0.4))' : 'none',
              }}
              whileHover={{
                scale: 1.05,
                filter: isActive
                  ? 'drop-shadow(0 0 16px rgba(198, 135, 240, 0.5)) brightness(1.05)'
                  : 'drop-shadow(0 0 8px rgba(198, 135, 240, 0.25)) brightness(1.02)',
              }}
              whileTap={{
                scale: 0.98,
                filter: 'drop-shadow(0 0 18px rgba(198, 135, 240, 0.6)) brightness(1.1)',
              }}
              whileFocus={{
                filter: 'drop-shadow(0 0 6px rgba(198, 135, 240, 0.4))',
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              aria-label={`Select octave ${octave}`}
              aria-pressed={isActive}
            >
              {octave}
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        Lower octaves make waveforms easier to see
      </p>
    </div>
  );
}
