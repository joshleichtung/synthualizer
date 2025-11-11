'use client';

import { motion } from 'framer-motion';

interface EngineSelectorProps {
  value: 'subtractive' | 'fm';
  onChange: (type: 'subtractive' | 'fm') => void;
}

/**
 * Engine type selector with interactive glow effects
 * Allows switching between subtractive and FM synthesis modes
 */
export function EngineSelector({ value, onChange }: EngineSelectorProps) {
  const engines: Array<{ type: 'subtractive' | 'fm'; label: string; description: string }> = [
    {
      type: 'subtractive',
      label: 'Subtractive',
      description: 'Oscillator + Filter',
    },
    {
      type: 'fm',
      label: 'FM Synthesis',
      description: 'Frequency Modulation',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Synthesis Engine</label>
      <div className="grid grid-cols-2 gap-3">
        {engines.map((engine) => {
          const isActive = value === engine.type;

          return (
            <motion.button
              key={engine.type}
              onClick={() => onChange(engine.type)}
              className={`
                px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all
                ${
                  isActive
                    ? 'bg-gradient-to-br from-coral-pink to-purple-soft text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200'
                }
              `}
              style={{
                filter: isActive
                  ? 'drop-shadow(0 0 14px rgba(255, 107, 157, 0.45))'
                  : 'drop-shadow(0 0 0px rgba(255, 107, 157, 0))',
              }}
              whileHover={{
                scale: 1.02,
                filter: isActive
                  ? 'brightness(1.05) drop-shadow(0 0 18px rgba(255, 107, 157, 0.55))'
                  : 'brightness(1.0) drop-shadow(0 0 10px rgba(255, 107, 157, 0.3))',
              }}
              whileTap={{
                scale: 0.98,
                filter: 'brightness(1.1) drop-shadow(0 0 20px rgba(255, 107, 157, 0.65))',
              }}
              whileFocus={{
                filter: 'drop-shadow(0 0 8px rgba(255, 107, 157, 0.4))',
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              aria-label={`Select ${engine.label} synthesis engine`}
              aria-pressed={isActive}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold">{engine.label}</span>
                <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                  {engine.description}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
