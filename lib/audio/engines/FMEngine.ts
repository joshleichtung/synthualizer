import { getAudioContext } from '../audioContext';
import { ISynthEngine } from '@/types/synth';

/**
 * FM (Frequency Modulation) synthesis engine
 *
 * Signal flow: Modulator Osc → Gain (modIndex) → Carrier.frequency
 *              Carrier Osc → Envelope Gain → Analyser → Output
 *
 * Educational Features:
 * - Classic carrier + modulator FM architecture
 * - Adjustable frequency ratio (harmonic vs inharmonic relationships)
 * - Modulation index controls spectral complexity (number of sidebands)
 * - Attack/release envelope shapes the output amplitude
 *
 * FM Theory:
 * - Carrier frequency (fc): The fundamental pitch you hear
 * - Modulator frequency (fm): Typically fc × ratio
 * - Modulation index (I): Depth of modulation, creates sidebands at fc ± n*fm
 * - Higher index = more sidebands = brighter, more complex timbre
 */
export class FMEngine implements ISynthEngine {
  private audioContext: AudioContext;

  // Oscillators (recreated per note)
  private carrierOsc: OscillatorNode | null = null;
  private modulatorOsc: OscillatorNode | null = null;

  // Persistent nodes
  private modulatorGain: GainNode;
  private outputGain: GainNode;
  private analyser: AnalyserNode;

  // State
  private isPlaying: boolean = false;
  private cleanupTimeoutId: number | null = null;

  // FM parameters
  private carrierWaveform: OscillatorType = 'sine';
  private modulatorWaveform: OscillatorType = 'sine';
  private frequencyRatio: number = 1.0;
  private modulationIndex: number = 2.0;
  private attackTime: number = 0.05;
  private releaseTime: number = 0.3;

  constructor() {
    this.audioContext = getAudioContext();

    // Create persistent nodes
    this.modulatorGain = this.audioContext.createGain();
    this.outputGain = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();

    // Initialize
    this.modulatorGain.gain.value = 0;
    this.outputGain.gain.value = 0;

    // Configure analyser (higher resolution for FM spectrum)
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect: Output → Analyser → Destination
    this.outputGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  /**
   * Start playing a note with FM synthesis
   * @param frequency - Carrier frequency in Hz
   * @param velocity - Note velocity (0-1), defaults to 1
   */
  start(frequency: number, velocity: number = 1): void {
    const now = this.audioContext.currentTime;

    // Cancel any pending cleanup
    if (this.cleanupTimeoutId !== null) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    // Immediately disconnect and clean up existing oscillators if present
    if (this.carrierOsc || this.modulatorOsc) {
      try {
        this.carrierOsc?.disconnect();
        this.carrierOsc?.stop(now);
        this.modulatorOsc?.disconnect();
        this.modulatorOsc?.stop(now);
      } catch (e) {
        // Oscillators might already be stopped, ignore error
      }
      this.carrierOsc = null;
      this.modulatorOsc = null;
    }

    // Create new oscillators
    this.carrierOsc = this.audioContext.createOscillator();
    this.modulatorOsc = this.audioContext.createOscillator();

    // Set waveforms
    this.carrierOsc.type = this.carrierWaveform;
    this.modulatorOsc.type = this.modulatorWaveform;

    // Calculate FM parameters
    const carrierFreq = frequency;
    const modulatorFreq = carrierFreq * this.frequencyRatio;
    const modulationDepth = carrierFreq * this.modulationIndex;

    // Set frequencies
    this.carrierOsc.frequency.value = carrierFreq;
    this.modulatorOsc.frequency.value = modulatorFreq;
    this.modulatorGain.gain.value = modulationDepth;

    // Connect FM chain: Modulator → Gain → Carrier.frequency
    this.modulatorOsc.connect(this.modulatorGain);
    this.modulatorGain.connect(this.carrierOsc.frequency);

    // Connect: Carrier → Output Gain → (already connected to analyser)
    this.carrierOsc.connect(this.outputGain);

    // Start oscillators
    this.modulatorOsc.start(now);
    this.carrierOsc.start(now);

    // Apply attack envelope
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setValueAtTime(0, now);
    this.outputGain.gain.linearRampToValueAtTime(
      velocity * 0.5, // Max gain at 50% to avoid clipping
      now + this.attackTime
    );

    this.isPlaying = true;
  }

  /**
   * Stop playing the current note
   */
  stop(): void {
    if (!this.carrierOsc || !this.modulatorOsc) return;

    const now = this.audioContext.currentTime;
    const carrierToStop = this.carrierOsc;
    const modulatorToStop = this.modulatorOsc;

    // Cancel any pending cleanup
    if (this.cleanupTimeoutId !== null) {
      clearTimeout(this.cleanupTimeoutId);
      this.cleanupTimeoutId = null;
    }

    // Apply release envelope
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setValueAtTime(this.outputGain.gain.value, now);
    this.outputGain.gain.linearRampToValueAtTime(0, now + this.releaseTime);

    // Stop oscillators after release
    try {
      carrierToStop.stop(now + this.releaseTime);
      modulatorToStop.stop(now + this.releaseTime);
    } catch (e) {
      // Oscillators might already be stopped, ignore error
    }

    // Immediately clear oscillator references to prevent overlaps
    this.carrierOsc = null;
    this.modulatorOsc = null;
    this.isPlaying = false;

    // Disconnect after the release time
    this.cleanupTimeoutId = window.setTimeout(() => {
      try {
        carrierToStop.disconnect();
        modulatorToStop.disconnect();
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
      case 'modulationIndex':
        this.modulationIndex = value as number;
        // Update modulation depth if currently playing
        if (this.carrierOsc && this.modulatorOsc) {
          const carrierFreq = this.carrierOsc.frequency.value;
          const newDepth = carrierFreq * this.modulationIndex;
          this.modulatorGain.gain.linearRampToValueAtTime(newDepth, now + rampTime);
        }
        break;

      case 'frequencyRatio':
        this.frequencyRatio = value as number;
        // Update modulator frequency if currently playing
        if (this.carrierOsc && this.modulatorOsc) {
          const carrierFreq = this.carrierOsc.frequency.value;
          const newModFreq = carrierFreq * this.frequencyRatio;
          this.modulatorOsc.frequency.exponentialRampToValueAtTime(
            Math.max(newModFreq, 0.01), // Ensure non-zero for exponential ramp
            now + rampTime
          );
        }
        break;

      case 'carrierWaveform':
        this.carrierWaveform = value as OscillatorType;
        if (this.carrierOsc) {
          this.carrierOsc.type = this.carrierWaveform;
        }
        break;

      case 'modulatorWaveform':
        this.modulatorWaveform = value as OscillatorType;
        if (this.modulatorOsc) {
          this.modulatorOsc.type = this.modulatorWaveform;
        }
        break;

      case 'attack':
        this.attackTime = value as number;
        break;

      case 'release':
        this.releaseTime = value as number;
        break;

      default:
        console.warn(`Unknown FM parameter: ${param}`);
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
      carrierWaveform: this.carrierWaveform,
      modulatorWaveform: this.modulatorWaveform,
      frequencyRatio: this.frequencyRatio,
      modulationIndex: this.modulationIndex,
      attack: this.attackTime,
      release: this.releaseTime,
      isPlaying: this.isPlaying,
    };
  }
}
