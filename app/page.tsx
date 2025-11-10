'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { SimpleSlider } from '@/components/controls/SimpleSlider';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { SimpleKeyboard } from '@/components/synth/SimpleKeyboard';

export default function Home() {
  const {
    engine,
    cutoff,
    resonance,
    waveform,
    initializeEngine,
    triggerNote,
    releaseNote,
    updateCutoff,
    updateResonance,
    setWaveform,
  } = useSynthStore();

  // Initialize audio engine on mount
  useEffect(() => {
    initializeEngine();
  }, [initializeEngine]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Synthualizer
          </h1>
          <p className="text-gray-600">
            Learn synthesis through visualization
          </p>
        </header>

        {/* Visualization */}
        <VisualizationContainer analyser={engine?.getAnalyser() || null} />

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Oscillator Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Oscillator</h2>
            <WaveformSelector value={waveform} onChange={setWaveform} />
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
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
        <SimpleKeyboard onNoteOn={triggerNote} onNoteOff={releaseNote} />

        {/* Footer info */}
        <footer className="text-center text-sm text-gray-500 pt-8">
          <p>Phase 1 MVP - Subtractive Synthesis Foundation</p>
          <p className="text-xs mt-1">
            Built with Next.js, TypeScript, Web Audio API, and Zustand
          </p>
        </footer>
      </div>
    </main>
  );
}
