'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { SimpleSlider } from '@/components/controls/SimpleSlider';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { OctaveSelector } from '@/components/controls/OctaveSelector';
import { SimpleKeyboard } from '@/components/synth/SimpleKeyboard';

export default function Home() {
  const {
    engine,
    cutoff,
    resonance,
    waveform,
    octave,
    activeFrequency,
    initializeEngine,
    toggleNote,
    updateCutoff,
    updateResonance,
    setWaveform,
    setOctave,
  } = useSynthStore();

  // Initialize audio engine on mount
  useEffect(() => {
    initializeEngine();
  }, [initializeEngine]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Visualization */}
        <VisualizationContainer analyser={engine?.getAnalyser() || null} />

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Oscillator Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Oscillator</h2>
            <WaveformSelector value={waveform} onChange={setWaveform} />
            <OctaveSelector value={octave} onChange={setOctave} />
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900">Filter</h2>
            <SimpleSlider
              label="Cutoff"
              value={cutoff}
              min={20}
              max={20000}
              step={10}
              onChange={updateCutoff}
              unit="Hz"
            />
            <SimpleSlider
              label="Resonance"
              value={resonance}
              min={0.1}
              max={20}
              step={0.1}
              onChange={updateResonance}
              unit="Q"
            />
          </div>
        </div>

        {/* Keyboard */}
        <SimpleKeyboard
          onNoteToggle={toggleNote}
          activeFrequency={activeFrequency}
          octave={octave}
        />
      </div>
    </main>
  );
}
