import { useEffect, useState } from 'react';

interface AudioAmplitudeResult {
  amplitude: number;
  averageAmplitude: number;
  isActive: boolean;
}

/**
 * Monitors audio amplitude from an AnalyserNode in real-time
 * Uses RMS (Root Mean Square) calculation for accurate amplitude measurement
 * Includes smoothing buffer to prevent jittery readings
 */
export function useAudioAmplitude(analyser: AnalyserNode | null): AudioAmplitudeResult {
  const [amplitude, setAmplitude] = useState(0);
  const [averageAmplitude, setAverageAmplitude] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!analyser) {
      setAmplitude(0);
      setAverageAmplitude(0);
      setIsActive(false);
      return;
    }

    // Check if audio context is active
    if (analyser.context.state === 'suspended') {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationId: number;

    // Smoothing buffer for more stable readings
    const amplitudeHistory: number[] = [];
    const HISTORY_SIZE = 10;

    const measure = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS amplitude
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Update history
      amplitudeHistory.push(rms);
      if (amplitudeHistory.length > HISTORY_SIZE) {
        amplitudeHistory.shift();
      }

      // Calculate smoothed average
      const avg = amplitudeHistory.reduce((a, b) => a + b, 0) / amplitudeHistory.length;

      setAmplitude(rms);
      setAverageAmplitude(avg);

      animationId = requestAnimationFrame(measure);
    };

    measure();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [analyser]);

  return { amplitude, averageAmplitude, isActive };
}
