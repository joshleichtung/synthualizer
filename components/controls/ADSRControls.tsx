'use client';

import { SimpleSlider } from './SimpleSlider';

interface ADSRControlsProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
}

/**
 * ADSR envelope controls with sliders
 * Provides interactive controls for Attack, Decay, Sustain, and Release parameters
 */
export function ADSRControls({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
}: ADSRControlsProps) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">ADSR Envelope</h3>

      <div className="space-y-4">
        <SimpleSlider
          label="Attack"
          value={attack * 1000} // Convert to ms for display
          min={0}
          max={2000}
          step={10}
          onChange={(value) => onAttackChange(value / 1000)} // Convert back to seconds
          unit="ms"
        />

        <SimpleSlider
          label="Decay"
          value={decay * 1000}
          min={0}
          max={2000}
          step={10}
          onChange={(value) => onDecayChange(value / 1000)}
          unit="ms"
        />

        <SimpleSlider
          label="Sustain"
          value={sustain * 100} // Convert to percentage for display
          min={0}
          max={100}
          step={1}
          onChange={(value) => onSustainChange(value / 100)} // Convert back to 0-1 range
          unit="%"
        />

        <SimpleSlider
          label="Release"
          value={release * 1000}
          min={0}
          max={5000}
          step={10}
          onChange={(value) => onReleaseChange(value / 1000)}
          unit="ms"
        />
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Attack:</strong> Time to reach peak volume<br />
          <strong>Decay:</strong> Time to fall to sustain level<br />
          <strong>Sustain:</strong> Level held while note is pressed<br />
          <strong>Release:</strong> Time to fade out after release
        </p>
      </div>
    </div>
  );
}
