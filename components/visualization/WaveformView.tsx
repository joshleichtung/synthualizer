'use client';

import { useEffect, useRef, useMemo } from 'react';

interface WaveformViewProps {
  analyser: AnalyserNode | null;
  filterNode: BiquadFilterNode | null;
  cutoff: number;
  resonance: number;
}

interface FilterResponseData {
  frequencies: Float32Array;
  magnitudes: Float32Array;
  lastCutoff: number;
  lastResonance: number;
}

/**
 * Utility: Map frequency to X position using logarithmic scale
 * Matches human perception of frequency
 */
const freqToX = (freq: number, canvasWidth: number): number => {
  const minFreq = 20;
  const maxFreq = 20000;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  const logFreq = Math.log10(Math.max(freq, minFreq));
  return ((logFreq - logMin) / (logMax - logMin)) * canvasWidth;
};

/**
 * Utility: Generate logarithmically spaced frequency array
 */
const generateLogFrequencies = (minFreq: number, maxFreq: number, numPoints: number): Float32Array => {
  const frequencies = new Float32Array(numPoints);
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const logFreq = logMin + t * (logMax - logMin);
    frequencies[i] = Math.pow(10, logFreq);
  }

  return frequencies;
};

/**
 * Real-time waveform visualization using Canvas
 * Displays oscilloscope-style time-domain audio data with triggering
 * Plus filter frequency response overlay
 */
export function WaveformView({ analyser, filterNode, cutoff, resonance }: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const phaseOffsetRef = useRef<number>(0);
  const filterResponseRef = useRef<FilterResponseData | null>(null);

  // Memoized logarithmic frequency array (never changes)
  const logFrequencies = useMemo(() => generateLogFrequencies(20, 20000, 128), []);

  // Calculate filter response when filter params change
  useEffect(() => {
    if (!filterNode) {
      filterResponseRef.current = null;
      return;
    }

    // Only recalculate if params changed
    if (
      filterResponseRef.current?.lastCutoff === cutoff &&
      filterResponseRef.current?.lastResonance === resonance
    ) {
      return;
    }

    // Calculate new frequency response
    const magnitudes = new Float32Array(logFrequencies.length);
    const phases = new Float32Array(logFrequencies.length);

    filterNode.getFrequencyResponse(logFrequencies, magnitudes, phases);

    filterResponseRef.current = {
      frequencies: logFrequencies,
      magnitudes,
      lastCutoff: cutoff,
      lastResonance: resonance,
    };
  }, [filterNode, cutoff, resonance, logFrequencies]);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Float32Array(analyser.fftSize);
    let canvasWidth = 0;
    let canvasHeight = 0;

    // Set canvas size to match display size with device pixel ratio
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvasWidth = rect.width;
      canvasHeight = rect.height;

      // Reset transform before scaling to prevent compounding
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /**
     * Find trigger point for oscilloscope-style display
     * Looks for an upward zero-crossing to stabilize the waveform
     */
    const findTriggerPoint = (data: Float32Array, threshold: number = 0.0): number => {
      // Start searching from a bit into the buffer to avoid edge effects
      const searchStart = Math.floor(data.length * 0.1);
      const searchEnd = Math.floor(data.length * 0.5);

      for (let i = searchStart; i < searchEnd; i++) {
        // Look for upward zero crossing (previous sample below threshold, current above)
        if (data[i - 1] < threshold && data[i] >= threshold) {
          return i;
        }
      }

      // No trigger found, return default starting point
      return 0;
    };

    /**
     * Draw subtle frequency bands (passband vs stopband)
     */
    const drawFrequencyBands = (cutoffX: number) => {
      // Passband (left of cutoff) - subtle cyan tint
      ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.fillRect(0, 0, cutoffX, canvasHeight);

      // Stopband (right of cutoff) - subtle red tint
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.fillRect(cutoffX, 0, canvasWidth - cutoffX, canvasHeight);
    };

    /**
     * Draw filter frequency response curve
     */
    const drawFilterCurve = (filterData: FilterResponseData) => {
      const curveHeight = canvasHeight * 0.25; // Top 25% of canvas

      ctx.beginPath();
      ctx.strokeStyle = '#F59E0B'; // Amber
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;

      filterData.frequencies.forEach((freq, i) => {
        const x = freqToX(freq, canvasWidth);
        // Map magnitude (0-1+) to Y position, inverted (canvas 0 is top)
        const magnitude = Math.min(filterData.magnitudes[i], 1.5); // Cap for display
        const y = curveHeight * (1 - magnitude);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.globalAlpha = 1.0;
    };

    /**
     * Draw cutoff frequency indicator line
     */
    const drawCutoffIndicator = (cutoffFreq: number) => {
      const x = freqToX(cutoffFreq, canvasWidth);

      // Dashed vertical line
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
      ctx.setLineDash([]); // Reset
      ctx.globalAlpha = 1.0;

      // Label with background
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fillRect(x + 5, 5, 70, 20);
      ctx.fillStyle = '#1F2937'; // Dark gray text
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${Math.round(cutoffFreq)} Hz`, x + 10, 18);
    };

    /**
     * Draw resonance peak glow
     */
    const drawResonanceGlow = (cutoffFreq: number, resonanceQ: number) => {
      const x = freqToX(cutoffFreq, canvasWidth);

      // Glow intensity based on Q value (0.1-20)
      const glowIntensity = Math.min(resonanceQ / 20, 1) * 15;

      if (glowIntensity > 1) {
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = glowIntensity;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, 25, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }
    };

    // Render loop - runs at ~60fps
    const render = () => {
      // Get time domain data from analyser
      analyser.getFloatTimeDomainData(dataArray);

      // Reset all shadow/style effects before clearing to prevent ghosting
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Clear completely for crisp display (no trails) - dark mouth interior
      ctx.fillStyle = 'rgba(17, 24, 39, 1)'; // Dark gray (gray-900)
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw frequency bands (if filter data available)
      if (filterResponseRef.current && filterNode) {
        const cutoffX = freqToX(cutoff, canvasWidth);
        drawFrequencyBands(cutoffX);
      }

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight / 2);
      ctx.lineTo(canvasWidth, canvasHeight / 2);
      ctx.stroke();

      // Find trigger point for stable display
      const triggerPoint = findTriggerPoint(dataArray);

      // Add very subtle drift by adjusting trigger threshold slightly over time
      phaseOffsetRef.current += 0.0002; // Very slow drift
      const driftingThreshold = Math.sin(phaseOffsetRef.current) * 0.02; // Oscillate between -0.02 and 0.02
      const driftedTrigger = findTriggerPoint(dataArray, driftingThreshold);

      // Calculate how many samples to display
      const samplesToDisplay = Math.min(
        Math.floor(dataArray.length / 2),
        dataArray.length - driftedTrigger
      );

      // Draw waveform starting from trigger point
      ctx.beginPath();
      ctx.strokeStyle = '#22D3EE'; // Bright cyan - pops against dark background!
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow effect
      ctx.shadowColor = '#22D3EE';
      ctx.shadowBlur = 10;

      for (let i = 0; i < samplesToDisplay; i++) {
        const dataIndex = driftedTrigger + i;

        const x = (i / samplesToDisplay) * canvasWidth;

        // Add vertical padding (10% on top and bottom) and scale amplitude to fit
        const amplitudeScale = 0.8; // Use 80% of height for waveform
        const centerY = canvasHeight / 2;
        const amplitude = dataArray[dataIndex];

        // Center waveform with padding: positive values go up, negative go down
        const y = centerY - (amplitude * (canvasHeight / 2) * amplitudeScale);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw filter visualization overlay (after waveform)
      if (filterResponseRef.current && filterNode) {
        drawFilterCurve(filterResponseRef.current);
        drawCutoffIndicator(cutoff);
        drawResonanceGlow(cutoff, resonance);
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser, filterNode, cutoff, resonance]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ imageRendering: 'auto', display: 'block' }}
    />
  );
}
