import { create } from 'zustand';
import { SubtractiveEngine } from '@/lib/audio/engines/SubtractiveEngine';

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
  // Engine instance
  engine: SubtractiveEngine | null;

  // Current parameters
  cutoff: number;
  resonance: number;
  waveform: OscillatorType;
  filterType: BiquadFilterType;
  octave: number;

  // Audio state
  isPlaying: boolean;
  currentNote: number | null;
  activeFrequency: number | null;

  // Interaction tracking for reactive eyes
  lastInteraction: InteractionState;

  // Actions
  initializeEngine: () => void;
  triggerNote: (frequency: number, velocity?: number) => void;
  releaseNote: () => void;
  toggleNote: (frequency: number | null) => void;
  updateCutoff: (value: number) => void;
  updateResonance: (value: number) => void;
  setWaveform: (waveform: OscillatorType) => void;
  setFilterType: (filterType: BiquadFilterType) => void;
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
  engine: null,
  cutoff: 1000,
  resonance: 1,
  waveform: 'sawtooth',
  filterType: 'lowpass',
  octave: 2, // Start at octave 2 for better waveform visibility
  isPlaying: false,
  currentNote: null,
  activeFrequency: null,
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
    const engine = new SubtractiveEngine();
    set({ engine });
  },

  /**
   * Trigger a note with the synth
   * @param frequency - Note frequency in Hz
   * @param velocity - Note velocity (0-1)
   */
  triggerNote: (frequency: number, velocity: number = 1) => {
    const { engine } = get();
    if (!engine) {
      console.warn('Engine not initialized. Call initializeEngine() first.');
      return;
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
    const { engine, activeFrequency } = get();
    if (!engine) {
      console.warn('Engine not initialized. Call initializeEngine() first.');
      return;
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
}));
