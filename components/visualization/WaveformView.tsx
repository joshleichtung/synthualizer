'use client';

import { useEffect, useRef } from 'react';

interface WaveformViewProps {
  analyser: AnalyserNode | null;
}

/**
 * Real-time waveform visualization using Canvas
 * Displays oscilloscope-style time-domain audio data with triggering
 */
export function WaveformView({ analyser }: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const phaseOffsetRef = useRef<number>(0);

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
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  );
}
