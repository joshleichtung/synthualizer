'use client';

import { SimpleSlider } from './SimpleSlider';
import { WaveformSelector } from './WaveformSelector';
import { InteractiveControl } from './InteractiveControl';

interface FMControlsProps {
  modulationIndex: number;
  frequencyRatio: number;
  carrierWaveform: OscillatorType;
  modulatorWaveform: OscillatorType;
  onModulationIndexChange: (value: number) => void;
  onFrequencyRatioChange: (value: number) => void;
  onCarrierWaveformChange: (waveform: OscillatorType) => void;
  onModulatorWaveformChange: (waveform: OscillatorType) => void;
}

/**
 * FM synthesis parameter controls
 *
 * Educational Notes:
 * - Modulation Index: Controls spectral complexity (number of sidebands)
 *   Higher values = brighter, more complex timbre
 * - Frequency Ratio: Relationship between modulator and carrier
 *   Integer ratios (1, 2, 3) = harmonic
 *   Non-integer ratios (1.4, 2.7) = inharmonic/bell-like
 */
export function FMControls({
  modulationIndex,
  frequencyRatio,
  carrierWaveform,
  modulatorWaveform,
  onModulationIndexChange,
  onFrequencyRatioChange,
  onCarrierWaveformChange,
  onModulatorWaveformChange,
}: FMControlsProps) {
  return (
    <div className="space-y-4">
      {/* FM Parameters Section */}
      <div>
        <h3 className="text-md font-semibold text-gray-800 mb-3">FM Parameters</h3>
        <div className="space-y-3">
          <InteractiveControl controlId="modulation-index-slider">
            <SimpleSlider
              label="Modulation Index"
              value={modulationIndex}
              min={0}
              max={10}
              step={0.1}
              onChange={onModulationIndexChange}
              unit=""
            />
          </InteractiveControl>
          <p className="text-xs text-gray-500 -mt-1">
            Controls spectral complexity (brightness)
          </p>

          <InteractiveControl controlId="frequency-ratio-slider">
            <SimpleSlider
              label="Frequency Ratio"
              value={frequencyRatio}
              min={0.5}
              max={8.0}
              step={0.1}
              onChange={onFrequencyRatioChange}
              unit="×"
            />
          </InteractiveControl>
          <p className="text-xs text-gray-500 -mt-1">
            Modulator : Carrier frequency ratio
          </p>
        </div>
      </div>

      {/* Oscillator Waveforms Section */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Oscillators</h3>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Carrier Waveform</p>
          <InteractiveControl controlId="carrier-waveform-selector">
            <WaveformSelector
              value={carrierWaveform}
              onChange={onCarrierWaveformChange}
            />
          </InteractiveControl>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Modulator Waveform</p>
          <InteractiveControl controlId="modulator-waveform-selector">
            <WaveformSelector
              value={modulatorWaveform}
              onChange={onModulatorWaveformChange}
            />
          </InteractiveControl>
        </div>
      </div>
    </div>
  );
}
