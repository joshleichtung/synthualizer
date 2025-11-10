'use client';

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (waveform: OscillatorType) => void;
}

/**
 * Waveform type selector with button grid
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
        {waveforms.map((wf) => (
          <button
            key={wf.type}
            onClick={() => onChange(wf.type)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${
                value === wf.type
                  ? 'bg-coral-pink text-white shadow-md shadow-coral-pink/30 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
              }
            `}
            aria-label={`Select ${wf.label} waveform`}
            aria-pressed={value === wf.type}
          >
            {wf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
