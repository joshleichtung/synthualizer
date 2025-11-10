import { create } from 'zustand';
import { SubtractiveEngine } from '@/lib/audio/engines/SubtractiveEngine';

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

  // Audio state
  isPlaying: boolean;
  currentNote: number | null;

  // Actions
  initializeEngine: () => void;
  triggerNote: (frequency: number, velocity?: number) => void;
  releaseNote: () => void;
  updateCutoff: (value: number) => void;
  updateResonance: (value: number) => void;
  setWaveform: (waveform: OscillatorType) => void;
  setFilterType: (filterType: BiquadFilterType) => void;
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
  isPlaying: false,
  currentNote: null,

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
}));
