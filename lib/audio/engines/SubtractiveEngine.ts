import { getAudioContext } from '../audioContext';
import { ISynthEngine } from '@/types/synth';

/**
 * Subtractive synthesis engine
 *
 * Signal flow: Oscillator → Filter → Gain → Analyser → Output
 *
 * Features (MVP):
 * - Single oscillator with multiple waveforms
 * - Biquad filter (low-pass, high-pass, band-pass)
 * - Simple attack/release envelope
 * - Real-time audio analysis for visualization
 */
export class SubtractiveEngine implements ISynthEngine {
  private audioContext: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private analyser: AnalyserNode;
  private isPlaying: boolean = false;
  private cleanupTimeoutId: number | null = null;

  // Current parameter values
  private currentWaveform: OscillatorType = 'sawtooth';
  private attackTime: number = 0.05;
  private releaseTime: number = 0.3;

  constructor() {
    this.audioContext = getAudioContext();

    // Create persistent nodes
    this.gainNode = this.audioContext.createGain();
    this.filterNode = this.audioContext.createBiquadFilter();
    this.analyser = this.audioContext.createAnalyser();

    // Set default values
    this.gainNode.gain.value = 0;
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 1000;
    this.filterNode.Q.value = 1;

    // Configure analyser for visualization
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect audio graph: Filter → Gain → Analyser → Destination
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Start playing a note
   * @param frequency - Frequency in Hz
   * @param velocity - Note velocity (0-1), defaults to 1
   */
  start(frequency: number, velocity: number = 1): void {
    const now = this.audioContext.currentTime;

    // Cancel any pending cleanup
    if (this.cleanupTimeoutId !== null) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    // Immediately disconnect and clean up existing oscillator if present
    if (this.oscillator) {
      try {
        this.oscillator.disconnect();
        this.oscillator.stop(now);
      } catch (e) {
        // Oscillator might already be stopped, ignore error
      }
      this.oscillator = null;
    }

    // Create new oscillator (can't reuse stopped oscillators)
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = this.currentWaveform;
    this.oscillator.frequency.value = frequency;

    // Connect oscillator to filter
    this.oscillator.connect(this.filterNode);
    this.oscillator.start(now);

    // Apply attack envelope
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(
      velocity * 0.5, // Max gain at 50% to avoid clipping
      now + this.attackTime
    );

    this.isPlaying = true;
  }

  /**
   * Stop playing the current note
   */
  stop(): void {
    if (!this.oscillator) return;

    const now = this.audioContext.currentTime;
    const oscillatorToStop = this.oscillator;

    // Cancel any pending cleanup
    if (this.cleanupTimeoutId !== null) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    // Apply release envelope
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + this.releaseTime);

    // Stop oscillator after release
    try {
      oscillatorToStop.stop(now + this.releaseTime);
    } catch (e) {
      // Oscillator might already be stopped, ignore error
    }

    // Immediately clear the oscillator reference to prevent overlaps
    this.oscillator = null;
    this.isPlaying = false;

    // Disconnect after the release time
    this.cleanupTimeoutId = window.setTimeout(() => {
      try {
        oscillatorToStop.disconnect();
      } catch (e) {
        // Already disconnected, ignore error
      }
      this.cleanupTimeoutId = null;
    }, this.releaseTime * 1000 + 100);
  }

  /**
   * Update a synthesis parameter
   * @param param - Parameter name
   * @param value - Parameter value
   */
  updateParameter(param: string, value: number | string): void {
    const now = this.audioContext.currentTime;
    const rampTime = 0.05; // Smooth parameter changes over 50ms

    switch (param) {
      case 'cutoff':
        this.filterNode.frequency.linearRampToValueAtTime(
          value as number,
          now + rampTime
        );
        break;

      case 'resonance':
        this.filterNode.Q.linearRampToValueAtTime(
          value as number,
          now + rampTime
        );
        break;

      case 'waveform':
        this.currentWaveform = value as OscillatorType;
        if (this.oscillator) {
          this.oscillator.type = this.currentWaveform;
        }
        break;

      case 'filterType':
        this.filterNode.type = value as BiquadFilterType;
        break;

      case 'attack':
        this.attackTime = value as number;
        break;

      case 'release':
        this.releaseTime = value as number;
        break;

      default:
        console.warn(`Unknown parameter: ${param}`);
    }
  }

  /**
   * Connect the synth output to a destination
   */
  connect(destination: AudioNode): void {
    this.analyser.connect(destination);
  }

  /**
   * Disconnect the synth output
   */
  disconnect(): void {
    this.analyser.disconnect();
  }

  /**
   * Get the analyser node for visualization
   */
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  /**
   * Check if a note is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current parameter values for debugging
   */
  getParameters() {
    return {
      waveform: this.currentWaveform,
      cutoff: this.filterNode.frequency.value,
      resonance: this.filterNode.Q.value,
      filterType: this.filterNode.type,
      attack: this.attackTime,
      release: this.releaseTime,
      isPlaying: this.isPlaying,
    };
  }
}
