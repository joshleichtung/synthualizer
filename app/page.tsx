'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { SimpleSlider } from '@/components/controls/SimpleSlider';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { OctaveSelector } from '@/components/controls/OctaveSelector';
import { SimpleKeyboard } from '@/components/synth/SimpleKeyboard';
import { CartoonEyes } from '@/components/character/CartoonEyes';
import { InteractiveControl } from '@/components/controls/InteractiveControl';

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
    <main className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-purple-400 p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between space-y-6">

        {/* Eyes at the top */}
        <div className="pt-8">
          <CartoonEyes />
        </div>

        {/* Mouth (Waveform) in the middle */}
        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full">
          <div className="w-full">
            <VisualizationContainer analyser={engine?.getAnalyser() || null} />
          </div>
        </div>

        {/* Controls at the bottom (compact, like a body/belly area) */}
        <div className="space-y-4 pb-4">
          {/* Compact control panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {/* Oscillator Section */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-4 border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Wave</h2>
              <InteractiveControl controlId="waveform-selector">
                <WaveformSelector value={waveform} onChange={setWaveform} />
              </InteractiveControl>
              <div className="mt-3">
                <InteractiveControl controlId="octave-selector">
                  <OctaveSelector value={octave} onChange={setOctave} />
                </InteractiveControl>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-4 border-gray-800 md:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Filter</h2>
              <div className="space-y-3">
                <InteractiveControl controlId="cutoff-slider">
                  <SimpleSlider
                    label="Cutoff"
                    value={cutoff}
                    min={20}
                    max={20000}
                    step={10}
                    onChange={updateCutoff}
                    unit="Hz"
                  />
                </InteractiveControl>
                <InteractiveControl controlId="resonance-slider">
                  <SimpleSlider
                    label="Resonance"
                    value={resonance}
                    min={0.1}
                    max={20}
                    step={0.1}
                    onChange={updateResonance}
                    unit="Q"
                  />
                </InteractiveControl>
              </div>
            </div>
          </div>

          {/* Keyboard */}
          <div className="max-w-5xl mx-auto">
            <SimpleKeyboard
              onNoteToggle={toggleNote}
              activeFrequency={activeFrequency}
              octave={octave}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
