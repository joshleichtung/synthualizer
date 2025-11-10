'use client';

import { motion } from 'framer-motion';

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (waveform: OscillatorType) => void;
}

/**
 * Enhanced waveform type selector with interactive glow effects
 * Allows switching between sine, square, sawtooth, and triangle waves
 */
export function WaveformSelector({ value, onChange }: WaveformSelectorProps) {
  const waveforms: Array<{ type: OscillatorType; label: string }> = [
    { type: 'sine', label: 'Sine' },
    { type: 'square', label: 'Square' },
    { type: 'sawtooth', label: 'Saw' },
    { type: 'triangle', label: 'Triangle' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Waveform
      </label>
      <div className="grid grid-cols-4 gap-2">
        {waveforms.map((wf) => {
          const isActive = value === wf.type;

          return (
            <motion.button
              key={wf.type}
              onClick={() => onChange(wf.type)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-coral-pink text-white shadow-md shadow-coral-pink/30'
                    : 'bg-gray-100 text-gray-700'
                }
              `}
              style={{
                filter: isActive ? 'drop-shadow(0 0 12px rgba(255, 107, 157, 0.4))' : 'none',
              }}
              whileHover={{
                scale: 1.05,
                filter: isActive
                  ? 'drop-shadow(0 0 16px rgba(255, 107, 157, 0.5)) brightness(1.05)'
                  : 'drop-shadow(0 0 8px rgba(255, 107, 157, 0.25)) brightness(1.02)',
              }}
              whileTap={{
                scale: 0.98,
                filter: 'drop-shadow(0 0 18px rgba(255, 107, 157, 0.6)) brightness(1.1)',
              }}
              whileFocus={{
                filter: 'drop-shadow(0 0 6px rgba(255, 107, 157, 0.4))',
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              aria-label={`Select ${wf.label} waveform`}
              aria-pressed={isActive}
            >
              {wf.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
