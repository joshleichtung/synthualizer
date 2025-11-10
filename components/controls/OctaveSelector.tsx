'use client';

interface OctaveSelectorProps {
  value: number;
  onChange: (octave: number) => void;
}

/**
 * Octave selector control
 * Allows switching between octaves 1-6
 */
export function OctaveSelector({ value, onChange }: OctaveSelectorProps) {
  const octaves = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Octave
      </label>
      <div className="flex gap-2">
        {octaves.map((octave) => (
          <button
            key={octave}
            onClick={() => onChange(octave)}
            className={`
              flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${
                value === octave
                  ? 'bg-coral-pink text-white shadow-md shadow-coral-pink/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            aria-label={`Select octave ${octave}`}
            aria-pressed={value === octave}
          >
            {octave}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Lower octaves make waveforms easier to see
      </p>
    </div>
  );
}
