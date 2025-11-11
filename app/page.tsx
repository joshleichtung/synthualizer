'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { SimpleSlider } from '@/components/controls/SimpleSlider';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { OctaveSelector } from '@/components/controls/OctaveSelector';
import { SimpleKeyboard } from '@/components/synth/SimpleKeyboard';
import { CartoonEyes } from '@/components/character/CartoonEyes';
import { CartoonNose } from '@/components/character/CartoonNose';
import { InteractiveControl } from '@/components/controls/InteractiveControl';
import { EngineSelector } from '@/components/controls/EngineSelector';
import { FMControls } from '@/components/controls/FMControls';
import { ADSRDisplay } from '@/components/controls/ADSRDisplay';
import { ADSRControls } from '@/components/controls/ADSRControls';

export default function Home() {
  const {
    engine,
    engineType,
    cutoff,
    resonance,
    waveform,
    octave,
    activeFrequency,
    modulationIndex,
    frequencyRatio,
    carrierWaveform,
    modulatorWaveform,
    attack,
    decay,
    sustain,
    release,
    initializeEngine,
    setEngineType,
    toggleNote,
    updateCutoff,
    updateResonance,
    updateModulationIndex,
    updateFrequencyRatio,
    setWaveform,
    setOctave,
    setCarrierWaveform,
    setModulatorWaveform,
    updateAttack,
    updateDecay,
    updateSustain,
    updateRelease,
  } = useSynthStore();

  // Initialize audio engine on first user interaction (lazy initialization)
  // This avoids browser warnings about AudioContext requiring user gesture
  useEffect(() => {
    // Engine will be initialized on first note trigger
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-purple-400 p-2 md:p-4 lg:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-between space-y-3 md:space-y-6">

        {/* Eyes at the top */}
        <div className="pt-2 md:pt-6 lg:pt-8">
          <CartoonEyes />
          <CartoonNose />
        </div>

        {/* Mouth (Waveform) in the middle */}
        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full">
          <div className="w-full">
            <VisualizationContainer
              analyser={engine?.getAnalyser() || null}
              filterNode={engineType === 'subtractive' && engine ? (engine as any).getFilterNode() : null}
              cutoff={cutoff}
              resonance={resonance}
              waveform={waveform}
            />
          </div>
        </div>

        {/* Controls at the bottom (compact, like a body/belly area) */}
        <div className="space-y-3 md:space-y-4 pb-2 md:pb-4">
          {/* Engine Selector */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur rounded-2xl p-3 md:p-4 shadow-xl border-2 md:border-4 border-gray-800">
              <InteractiveControl controlId="engine-selector">
                <EngineSelector value={engineType} onChange={setEngineType} />
              </InteractiveControl>
            </div>
          </div>

          {/* Compact control panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
            {/* Common Oscillator Section (shown for both engines) */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-3 md:p-4 shadow-xl border-2 md:border-4 border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                {engineType === 'subtractive' ? 'Wave' : 'Common'}
              </h2>
              {engineType === 'subtractive' && (
                <InteractiveControl controlId="waveform-selector">
                  <WaveformSelector value={waveform} onChange={setWaveform} />
                </InteractiveControl>
              )}
              <div className={engineType === 'subtractive' ? 'mt-3' : ''}>
                <InteractiveControl controlId="octave-selector">
                  <OctaveSelector value={octave} onChange={setOctave} />
                </InteractiveControl>
              </div>
            </div>

            {/* Engine-Specific Controls */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-3 md:p-4 shadow-xl border-2 md:border-4 border-gray-800 lg:col-span-2">
              {engineType === 'subtractive' ? (
                // Subtractive Filter Section
                <>
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
                </>
              ) : (
                // FM Controls Section
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-3">FM Synthesis</h2>
                  <FMControls
                    modulationIndex={modulationIndex}
                    frequencyRatio={frequencyRatio}
                    carrierWaveform={carrierWaveform}
                    modulatorWaveform={modulatorWaveform}
                    onModulationIndexChange={updateModulationIndex}
                    onFrequencyRatioChange={updateFrequencyRatio}
                    onCarrierWaveformChange={setCarrierWaveform}
                    onModulatorWaveformChange={setModulatorWaveform}
                  />
                </>
              )}
            </div>
          </div>

          {/* ADSR Envelope Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto">
            {/* ADSR Visual Display */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 md:border-4 border-gray-800 overflow-hidden">
              <ADSRDisplay
                attack={attack}
                decay={decay}
                sustain={sustain}
                release={release}
              />
            </div>

            {/* ADSR Controls */}
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border-2 md:border-4 border-gray-800 overflow-hidden lg:col-span-2">
              <ADSRControls
                attack={attack}
                decay={decay}
                sustain={sustain}
                release={release}
                onAttackChange={updateAttack}
                onDecayChange={updateDecay}
                onSustainChange={updateSustain}
                onReleaseChange={updateRelease}
              />
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
