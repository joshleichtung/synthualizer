/**
 * Voice types for polyphonic synthesis
 * Shared by both SubtractiveEngine and FMEngine
 */

/**
 * Represents a single voice in the polyphonic voice pool
 */
export interface Voice {
  // Identity & State
  id: number;                     // Voice index in pool (0-5)
  active: boolean;                // Is voice currently playing?
  frequency: number | null;       // Current note frequency (Hz), null when inactive
  noteStartTime: number;          // AudioContext time when note started

  // Subtractive Synthesis Nodes
  oscillator: OscillatorNode | null;
  voiceGain: GainNode;            // Per-voice ADSR envelope

  // FM Synthesis Nodes (additional)
  modulatorOsc?: OscillatorNode | null;
  modulatorGain?: GainNode;       // Modulation depth control
}

/**
 * Voice allocation strategy
 */
export type VoiceStealingStrategy = 'oldest' | 'quietest' | 'lowest' | 'highest';

/**
 * Voice state for debugging
 */
export interface VoiceDebugInfo {
  id: number;
  active: boolean;
  frequency: number | null;
  age: number;                    // Time since note started (ms)
  gainValue: number;              // Current gain value
}
