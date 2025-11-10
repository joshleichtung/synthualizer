/**
 * Core synthesis engine interface
 */
export interface ISynthEngine {
  start(frequency: number, velocity?: number): void;
  stop(): void;
  updateParameter(param: string, value: number): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
  getAnalyser(): AnalyserNode;
}

/**
 * Subtractive synthesis parameters
 */
export interface SubtractiveSynthParams {
  // Oscillator
  waveform: OscillatorType;
  detune: number;

  // Filter
  filterType: BiquadFilterType;
  cutoff: number;
  resonance: number;

  // Basic envelope (attack and release for MVP)
  attack: number;
  release: number;
}

/**
 * Audio visualization data
 */
export interface AudioData {
  waveform: Float32Array;
  frequency: Uint8Array;
}
