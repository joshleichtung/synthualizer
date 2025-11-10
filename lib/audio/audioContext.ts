/**
 * Global audio context manager
 * Handles audio context lifecycle and provides singleton access
 */

let audioContext: AudioContext | null = null;

/**
 * Get or create the global audio context
 * Automatically resumes if suspended (browser autoplay policy)
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Resume if suspended (required by browser autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

/**
 * Close and cleanup the audio context
 */
export function closeAudioContext(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

/**
 * Get the current audio context state
 */
export function getAudioContextState(): AudioContextState | null {
  return audioContext?.state || null;
}
