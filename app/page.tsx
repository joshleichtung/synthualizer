'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { Knob } from '@/components/controls/Knob';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { OctaveSelector } from '@/components/controls/OctaveSelector';
import { CartoonEyes } from '@/components/character/CartoonEyes';
import { InteractiveControl } from '@/components/controls/InteractiveControl';
import { EngineSelector } from '@/components/controls/EngineSelector';
import { FMControls } from '@/components/controls/FMControls';
import { ADSRDisplay } from '@/components/controls/ADSRDisplay';
import { TabbedPanel } from '@/components/controls/TabbedPanel';

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

  // Enable QWERTY keyboard input
  useKeyboardInput();

  // Initialize audio engine on first user interaction (lazy initialization)
  // This avoids browser warnings about AudioContext requiring user gesture
  useEffect(() => {
    // Engine will be initialized on first note trigger
  }, []);

  return (
    <main className="h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-purple-400 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col p-4 pt-8">

        {/* Eyes: Fixed height with padding for eyebrows */}
        <div className="flex-none h-24 flex items-center justify-center mb-4">
          <CartoonEyes />
        </div>

        {/* Waveform visualization: Flexible but constrained */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-4">
          <div className="w-full max-h-[280px] max-w-5xl">
            <VisualizationContainer
              analyser={engine?.getAnalyser() || null}
              filterNode={engineType === 'subtractive' && engine ? (engine as any).getFilterNode() : null}
              cutoff={cutoff}
              resonance={resonance}
              waveform={waveform}
            />
          </div>
        </div>

        {/* Controls: Fixed height, tabbed panels */}
        <div className="flex-none h-[280px] max-w-6xl mx-auto w-full mt-4">
          {/* Tabbed control panels */}
          <TabbedPanel
            defaultTab="synth"
            tabs={[
              {
                id: 'synth',
                label: 'Synth',
                content: (
                  <div className="p-4 h-[240px] flex flex-col justify-between">
                    {/* Top row: Engine selector (compact) + Wave/Octave selectors */}
                    <div className="flex items-center gap-6">
                      {/* Compact engine selector */}
                      <div className="flex-none">
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Engine</label>
                        <InteractiveControl controlId="engine-selector">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEngineType('subtractive')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                                engineType === 'subtractive'
                                  ? 'bg-coral-pink text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Sub
                            </button>
                            <button
                              onClick={() => setEngineType('fm')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                                engineType === 'fm'
                                  ? 'bg-coral-pink text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              FM
                            </button>
                          </div>
                        </InteractiveControl>
                      </div>

                      {/* Wave selector */}
                      {engineType === 'subtractive' && (
                        <div className="flex-none">
                          <InteractiveControl controlId="waveform-selector">
                            <WaveformSelector value={waveform} onChange={setWaveform} />
                          </InteractiveControl>
                        </div>
                      )}

                      {/* Octave +/- */}
                      <div className="flex-none">
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">Octave</label>
                        <InteractiveControl controlId="octave-selector">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setOctave(Math.max(1, octave - 1))}
                              disabled={octave <= 1}
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">{octave}</span>
                            <button
                              onClick={() => setOctave(Math.min(6, octave + 1))}
                              disabled={octave >= 6}
                              className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-gray-700"
                            >
                              +
                            </button>
                          </div>
                        </InteractiveControl>
                      </div>
                    </div>

                    {/* Bottom row: Knobs */}
                    <div className="flex gap-6 justify-center items-center">
                      {engineType === 'subtractive' ? (
                        <>
                          <InteractiveControl controlId="cutoff-knob">
                            <Knob
                              label="Cutoff"
                              value={cutoff}
                              min={20}
                              max={20000}
                              step={10}
                              onChange={updateCutoff}
                              unit="Hz"
                              logarithmic
                            />
                          </InteractiveControl>
                          <InteractiveControl controlId="resonance-knob">
                            <Knob
                              label="Resonance"
                              value={resonance}
                              min={0.1}
                              max={20}
                              step={0.1}
                              onChange={updateResonance}
                              unit="Q"
                            />
                          </InteractiveControl>
                        </>
                      ) : (
                        <div className="text-sm text-gray-700">FM Controls Coming Soon</div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                id: 'envelope',
                label: 'Envelope',
                content: (
                  <div className="p-4 h-[240px] flex items-center gap-6">
                    {/* ADSR Visual */}
                    <div className="flex-none w-48">
                      <ADSRDisplay
                        attack={attack}
                        decay={decay}
                        sustain={sustain}
                        release={release}
                      />
                    </div>

                    {/* ADSR Knobs */}
                    <div className="flex-1 flex gap-6 justify-center items-center">
                      <InteractiveControl controlId="attack-knob">
                        <Knob
                          label="Attack"
                          value={attack}
                          min={0}
                          max={2}
                          step={0.01}
                          onChange={updateAttack}
                          unit="s"
                        />
                      </InteractiveControl>
                      <InteractiveControl controlId="decay-knob">
                        <Knob
                          label="Decay"
                          value={decay}
                          min={0}
                          max={2}
                          step={0.01}
                          onChange={updateDecay}
                          unit="s"
                        />
                      </InteractiveControl>
                      <InteractiveControl controlId="sustain-knob">
                        <Knob
                          label="Sustain"
                          value={sustain}
                          min={0}
                          max={1}
                          step={0.01}
                          onChange={updateSustain}
                        />
                      </InteractiveControl>
                      <InteractiveControl controlId="release-knob">
                        <Knob
                          label="Release"
                          value={release}
                          min={0}
                          max={5}
                          step={0.01}
                          onChange={updateRelease}
                          unit="s"
                        />
                      </InteractiveControl>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </main>
  );
}
