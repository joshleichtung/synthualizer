import { getAudioContext } from '../audioContext';
import { ISynthEngine } from '@/types/synth';
import { Voice } from '@/types/voice';

/**
 * Subtractive synthesis engine - Polyphonic (6 voices)
 *
 * Signal flow: Voice → Mixer → Filter → Master Gain → Analyser → Output
 * Each voice: Oscillator → Voice Gain (ADSR)
 *
 * Features:
 * - 6-voice polyphony with voice stealing
 * - Per-voice ADSR envelopes
 * - Shared filter and master gain
 * - Real-time audio analysis for visualization
 */
export class SubtractiveEngine implements ISynthEngine {
  private audioContext: AudioContext;

  // Voice pool (6 voices)
  private voices: Voice[] = [];
  private activeNotes: Map<number, Voice> = new Map(); // frequency → voice

  // Shared audio nodes
  private mixer: GainNode;          // Mix all voices
  private filterNode: BiquadFilterNode;
  private masterGain: GainNode;     // Master output
  private analyser: AnalyserNode;

  // Current parameter values
  private currentWaveform: OscillatorType = 'sawtooth';

  // ADSR envelope parameters (shared by all voices)
  private attackTime: number = 0.01;
  private decayTime: number = 0.1;
  private sustainLevel: number = 0.7;
  private releaseTime: number = 0.3;

  // Voice management
  private readonly MAX_VOICES = 6;

  constructor() {
    this.audioContext = getAudioContext();

    // Create shared audio nodes
    this.mixer = this.audioContext.createGain();
    this.filterNode = this.audioContext.createBiquadFilter();
    this.masterGain = this.audioContext.createGain();
    this.analyser = this.audioContext.createAnalyser();

    // Set default values
    this.mixer.gain.value = 1.0;
    this.masterGain.gain.value = 1.0;
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 1000;
    this.filterNode.Q.value = 1;

    // Configure analyser for visualization
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect audio graph: Mixer → Filter → Master → Analyser → Destination
    this.mixer.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Create voice pool
    for (let i = 0; i < this.MAX_VOICES; i++) {
      this.voices.push(this.createVoice(i));
    }
  }

  /**
   * Create a new voice in the pool
   */
  private createVoice(id: number): Voice {
    const voiceGain = this.audioContext.createGain();
    voiceGain.gain.value = 0;
    voiceGain.connect(this.mixer);

    return {
      id,
      active: false,
      frequency: null,
      noteStartTime: 0,
      oscillator: null,
      voiceGain,
    };
  }

  /**
   * Start a voice's oscillator
   */
  private startVoiceOscillator(voice: Voice, frequency: number): void {
    // Create oscillator
    voice.oscillator = this.audioContext.createOscillator();
    voice.oscillator.type = this.currentWaveform;
    voice.oscillator.frequency.value = frequency;

    // Connect to voice gain
    voice.oscillator.connect(voice.voiceGain);

    // Start immediately
    voice.oscillator.start(this.audioContext.currentTime);
  }

  /**
   * Stop a voice's oscillator
   */
  private stopVoiceOscillator(voice: Voice, when: number = this.audioContext.currentTime): void {
    if (!voice.oscillator) return;

    try {
      voice.oscillator.stop(when);
      voice.oscillator.disconnect();
    } catch (e) {
      // Oscillator might already be stopped
    }

    voice.oscillator = null;
  }

  /**
   * Trigger attack phase for a voice
   */
  private triggerAttack(voice: Voice, velocity: number): void {
    const now = this.audioContext.currentTime;

    // Calculate gain values (divide by MAX_VOICES to prevent clipping when all play)
    const peakGain = (velocity * 0.5) / this.MAX_VOICES;
    const sustainGain = Math.max(peakGain * this.sustainLevel, 0.001);

    // Cancel any scheduled automation
    voice.voiceGain.gain.cancelScheduledValues(now);

    // ATTACK: 0 → peak
    voice.voiceGain.gain.setValueAtTime(0, now);
    voice.voiceGain.gain.linearRampToValueAtTime(peakGain, now + this.attackTime);

    // DECAY: peak → sustain
    const decayStartTime = now + this.attackTime;
    if (this.decayTime > 0.001) {
      if (sustainGain >= 0.01) {
        voice.voiceGain.gain.exponentialRampToValueAtTime(
          sustainGain,
          decayStartTime + this.decayTime
        );
      } else {
        voice.voiceGain.gain.linearRampToValueAtTime(
          sustainGain,
          decayStartTime + this.decayTime
        );
      }
    }

    // SUSTAIN: Hold at sustainGain (no automation needed)
  }

  /**
   * Trigger release phase for a voice
   */
  private triggerRelease(voice: Voice): void {
    const now = this.audioContext.currentTime;
    const currentGain = voice.voiceGain.gain.value;

    // Cancel scheduled automation
    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(currentGain, now);

    // RELEASE: current value → 0
    voice.voiceGain.gain.exponentialRampToValueAtTime(
      0.001,
      now + this.releaseTime
    );

    // Stop oscillator after release
    this.stopVoiceOscillator(voice, now + this.releaseTime);

    // Mark voice as inactive after release completes
    window.setTimeout(() => {
      voice.active = false;
      voice.frequency = null;
    }, this.releaseTime * 1000 + 100);
  }

  /**
   * Find a free voice or steal the oldest one
   */
  private allocateVoice(): Voice {
    // Try to find a free voice
    const freeVoice = this.voices.find(v => !v.active);
    if (freeVoice) {
      return freeVoice;
    }

    // All voices busy - steal oldest voice (polite stealing)
    const oldestVoice = this.voices.reduce((oldest, current) =>
      current.noteStartTime < oldest.noteStartTime ? current : oldest
    );

    // Trigger release on stolen voice before re-using
    if (oldestVoice.frequency !== null) {
      this.activeNotes.delete(oldestVoice.frequency);
      this.triggerRelease(oldestVoice);
    }

    return oldestVoice;
  }

  /**
   * Start playing a note (polyphonic noteOn)
   * @param frequency - Frequency in Hz
   * @param velocity - Note velocity (0-1), defaults to 1
   */
  noteOn(frequency: number, velocity: number = 1): void {
    // Check if note is already playing (re-trigger)
    let voice = this.activeNotes.get(frequency);
    if (voice) {
      // Re-trigger: stop current oscillator, restart with new attack
      this.stopVoiceOscillator(voice);
      this.startVoiceOscillator(voice, frequency);
      voice.noteStartTime = this.audioContext.currentTime;
      this.triggerAttack(voice, velocity);
      return;
    }

    // Allocate a voice (free or steal oldest)
    voice = this.allocateVoice();

    // Set up voice
    voice.active = true;
    voice.frequency = frequency;
    voice.noteStartTime = this.audioContext.currentTime;

    // Start oscillator and trigger attack
    this.startVoiceOscillator(voice, frequency);
    this.activeNotes.set(frequency, voice);
    this.triggerAttack(voice, velocity);
  }

  /**
   * Stop playing a note (polyphonic noteOff)
   * @param frequency - Frequency in Hz
   */
  noteOff(frequency: number): void {
    const voice = this.activeNotes.get(frequency);
    if (!voice) return;

    // Remove from active notes
    this.activeNotes.delete(frequency);

    // Trigger release envelope
    this.triggerRelease(voice);
  }

  /**
   * Legacy start method for backward compatibility
   * @deprecated Use noteOn instead
   */
  start(frequency: number, velocity: number = 1): void {
    this.noteOn(frequency, velocity);
  }

  /**
   * Legacy stop method for backward compatibility
   * Stops all playing notes
   * @deprecated Use noteOff instead
   */
  stop(): void {
    // Release all active notes
    this.activeNotes.forEach((voice, frequency) => {
      this.noteOff(frequency);
    });
  }

  /**
   * Update a synthesis parameter
   * @param param - Parameter name
   * @param value - Parameter value
   */
  updateParameter(param: string, value: number | string): void {
    const now = this.audioContext.currentTime;
    const rampTime = 0.05;

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
        // Update all active oscillators
        this.voices.forEach(voice => {
          if (voice.oscillator) {
            voice.oscillator.type = this.currentWaveform;
          }
        });
        break;

      case 'filterType':
        this.filterNode.type = value as BiquadFilterType;
        break;

      case 'attack':
        this.attackTime = Math.max(0, Math.min(2, value as number));
        break;

      case 'decay':
        this.decayTime = Math.max(0, Math.min(2, value as number));
        break;

      case 'sustain':
        this.sustainLevel = Math.max(0, Math.min(1, value as number));
        break;

      case 'release':
        this.releaseTime = Math.max(0, Math.min(5, value as number));
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
   * Get the filter node for visualization
   */
  getFilterNode(): BiquadFilterNode {
    return this.filterNode;
  }

  /**
   * Check if any notes are currently playing
   */
  getIsPlaying(): boolean {
    return this.activeNotes.size > 0;
  }

  /**
   * Get count of active voices
   */
  getActiveVoiceCount(): number {
    return this.voices.filter(v => v.active).length;
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
      decay: this.decayTime,
      sustain: this.sustainLevel,
      release: this.releaseTime,
      isPlaying: this.getIsPlaying(),
      activeVoices: this.getActiveVoiceCount(),
      maxVoices: this.MAX_VOICES,
    };
  }
}
