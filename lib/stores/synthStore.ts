import { create } from 'zustand';
import { SubtractiveEngine } from '@/lib/audio/engines/SubtractiveEngine';
import { FMEngine } from '@/lib/audio/engines/FMEngine';

/**
 * Interaction tracking state
 */
interface InteractionState {
  elementId: string | null;
  position: { x: number; y: number } | null;
  timestamp: number;
}

/**
 * Synth state interface
 */
interface SynthState {
  // Engine selection and instance
  engineType: 'subtractive' | 'fm';
  engine: SubtractiveEngine | FMEngine | null;

  // Common parameters (both engines)
  waveform: OscillatorType;
  octave: number;

  // Subtractive-specific parameters
  cutoff: number;
  resonance: number;
  filterType: BiquadFilterType;

  // FM-specific parameters
  modulationIndex: number;
  frequencyRatio: number;
  modulatorWaveform: OscillatorType;
  carrierWaveform: OscillatorType;

  // ADSR envelope parameters (shared by both engines)
  attack: number;
  decay: number;
  sustain: number;
  release: number;

  // Audio state
  isPlaying: boolean;
  currentNote: number | null;
  activeFrequency: number | null;

  // Interaction tracking for reactive eyes
  lastInteraction: InteractionState;

  // Actions
  initializeEngine: () => void;
  setEngineType: (type: 'subtractive' | 'fm') => void;
  triggerNote: (frequency: number, velocity?: number) => void;
  releaseNote: () => void;
  toggleNote: (frequency: number | null) => void;

  // Subtractive actions
  updateCutoff: (value: number) => void;
  updateResonance: (value: number) => void;
  setFilterType: (filterType: BiquadFilterType) => void;

  // FM actions
  updateModulationIndex: (value: number) => void;
  updateFrequencyRatio: (value: number) => void;
  setModulatorWaveform: (waveform: OscillatorType) => void;
  setCarrierWaveform: (waveform: OscillatorType) => void;

  // ADSR actions
  updateAttack: (value: number) => void;
  updateDecay: (value: number) => void;
  updateSustain: (value: number) => void;
  updateRelease: (value: number) => void;

  // Common actions
  setWaveform: (waveform: OscillatorType) => void;
  setOctave: (octave: number) => void;
  setInteraction: (elementId: string, position: { x: number; y: number }) => void;
  clearInteraction: () => void;
}

/**
 * Global synth store using Zustand
 * Manages synthesis engine and parameter state
 */
export const useSynthStore = create<SynthState>((set, get) => ({
  // Initial state
  engineType: 'subtractive',
  engine: null,

  // Common parameters
  waveform: 'sawtooth',
  octave: 2, // Start at octave 2 for better waveform visibility

  // Subtractive parameters
  cutoff: 1000,
  resonance: 1,
  filterType: 'lowpass',

  // FM parameters
  modulationIndex: 2.0,
  frequencyRatio: 1.0,
  modulatorWaveform: 'sine',
  carrierWaveform: 'sine',

  // ADSR envelope parameters (in seconds, except sustain which is 0-1)
  attack: 0.01,
  decay: 0.1,
  sustain: 0.7,
  release: 0.3,

  // Audio state
  isPlaying: false,
  currentNote: null,
  activeFrequency: null,

  // Interaction state
  lastInteraction: {
    elementId: null,
    position: null,
    timestamp: 0,
  },

  /**
   * Initialize the synthesis engine
   * Must be called before playing notes (typically in useEffect)
   */
  initializeEngine: () => {
    const { engineType } = get();
    const engine = engineType === 'fm' ? new FMEngine() : new SubtractiveEngine();
    set({ engine });
  },

  /**
   * Switch between synthesis engine types
   * @param type - Engine type ('subtractive' or 'fm')
   */
  setEngineType: (type: 'subtractive' | 'fm') => {
    const { engine, activeFrequency } = get();

    // Stop current note if playing
    if (engine && activeFrequency !== null) {
      engine.stop();
    }

    // Clean up old engine
    engine?.disconnect();

    // Create new engine
    const newEngine = type === 'fm' ? new FMEngine() : new SubtractiveEngine();

    set({
      engineType: type,
      engine: newEngine,
      isPlaying: false,
      currentNote: null,
      activeFrequency: null,
    });
  },

  /**
   * Trigger a note with the synth
   * @param frequency - Note frequency in Hz
   * @param velocity - Note velocity (0-1)
   */
  triggerNote: (frequency: number, velocity: number = 1) => {
    let { engine, initializeEngine } = get();

    // Lazy initialize engine on first interaction
    if (!engine) {
      initializeEngine();
      engine = get().engine;
      if (!engine) {
        console.error('Failed to initialize engine');
        return;
      }
    }

    engine.start(frequency, velocity);
    set({ isPlaying: true, currentNote: frequency });
  },

  /**
   * Release the currently playing note
   */
  releaseNote: () => {
    const { engine } = get();
    if (!engine) return;

    engine.stop();
    set({ isPlaying: false, currentNote: null });
  },

  /**
   * Update filter cutoff frequency
   * @param value - Cutoff frequency in Hz (20-20000)
   */
  updateCutoff: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('cutoff', value);
    set({ cutoff: value });
  },

  /**
   * Update filter resonance (Q factor)
   * @param value - Resonance value (0.1-20)
   */
  updateResonance: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('resonance', value);
    set({ resonance: value });
  },

  /**
   * Set oscillator waveform
   * @param waveform - Waveform type
   */
  setWaveform: (waveform: OscillatorType) => {
    const { engine } = get();
    engine?.updateParameter('waveform', waveform);
    set({ waveform });
  },

  /**
   * Set filter type
   * @param filterType - Filter type (lowpass, highpass, bandpass)
   */
  setFilterType: (filterType: BiquadFilterType) => {
    const { engine } = get();
    engine?.updateParameter('filterType', filterType);
    set({ filterType });
  },

  /**
   * Toggle a note on or off
   * @param frequency - Note frequency in Hz, or null to stop
   */
  toggleNote: (frequency: number | null) => {
    let { engine, activeFrequency, initializeEngine } = get();

    // Lazy initialize engine on first interaction
    if (!engine) {
      initializeEngine();
      engine = get().engine;
      if (!engine) {
        console.error('Failed to initialize engine');
        return;
      }
    }

    if (frequency === null || activeFrequency !== null) {
      // Stop current note
      engine.stop();
      set({ isPlaying: false, currentNote: null, activeFrequency: null });
    }

    if (frequency !== null && activeFrequency !== frequency) {
      // Start new note
      engine.start(frequency, 1);
      set({ isPlaying: true, currentNote: frequency, activeFrequency: frequency });
    }
  },

  /**
   * Set the current octave
   * @param octave - Octave number (1-6)
   */
  setOctave: (octave: number) => {
    const { activeFrequency, engine } = get();

    // If a note is playing, stop it when changing octaves
    if (activeFrequency !== null && engine) {
      engine.stop();
      set({ isPlaying: false, currentNote: null, activeFrequency: null });
    }

    set({ octave });
  },

  /**
   * Set interaction target for reactive eyes
   * @param elementId - Unique ID of the control being interacted with
   * @param position - Screen coordinates of the control center
   */
  setInteraction: (elementId: string, position: { x: number; y: number }) => {
    set({
      lastInteraction: {
        elementId,
        position,
        timestamp: Date.now(),
      },
    });
  },

  /**
   * Clear current interaction (eyes return to random movement)
   */
  clearInteraction: () => {
    set({
      lastInteraction: {
        elementId: null,
        position: null,
        timestamp: Date.now(),
      },
    });
  },

  /**
   * Update FM modulation index
   * @param value - Modulation index (0-10)
   */
  updateModulationIndex: (value: number) => {
    const { engine, engineType } = get();
    if (engineType === 'fm' && engine) {
      engine.updateParameter('modulationIndex', value);
      set({ modulationIndex: value });
    }
  },

  /**
   * Update FM frequency ratio
   * @param value - Frequency ratio (0.5-8.0)
   */
  updateFrequencyRatio: (value: number) => {
    const { engine, engineType } = get();
    if (engineType === 'fm' && engine) {
      engine.updateParameter('frequencyRatio', value);
      set({ frequencyRatio: value });
    }
  },

  /**
   * Set modulator waveform (FM only)
   * @param waveform - Waveform type
   */
  setModulatorWaveform: (waveform: OscillatorType) => {
    const { engine, engineType } = get();
    if (engineType === 'fm' && engine) {
      engine.updateParameter('modulatorWaveform', waveform);
      set({ modulatorWaveform: waveform });
    }
  },

  /**
   * Set carrier waveform (FM only)
   * @param waveform - Waveform type
   */
  setCarrierWaveform: (waveform: OscillatorType) => {
    const { engine, engineType } = get();
    if (engineType === 'fm' && engine) {
      engine.updateParameter('carrierWaveform', waveform);
      set({ carrierWaveform: waveform });
    }
  },

  /**
   * Update ADSR attack time
   * @param value - Attack time in seconds (0-2)
   */
  updateAttack: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('attack', value);
    set({ attack: value });
  },

  /**
   * Update ADSR decay time
   * @param value - Decay time in seconds (0-2)
   */
  updateDecay: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('decay', value);
    set({ decay: value });
  },

  /**
   * Update ADSR sustain level
   * @param value - Sustain level (0-1)
   */
  updateSustain: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('sustain', value);
    set({ sustain: value });
  },

  /**
   * Update ADSR release time
   * @param value - Release time in seconds (0-5)
   */
  updateRelease: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('release', value);
    set({ release: value });
  },
}));
