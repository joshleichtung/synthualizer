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

    // Set canvas size to match display size with device pixel ratio
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
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

      const { width, height } = canvas.getBoundingClientRect();

      // Clear completely for crisp display (no trails) - dark mouth interior
      ctx.fillStyle = 'rgba(17, 24, 39, 1)'; // Dark gray (gray-900)
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Find trigger point for stable display
      const triggerPoint = findTriggerPoint(dataArray);

      // Add slow drift effect (increment phase offset slowly)
      phaseOffsetRef.current += 1.0; // Adjust this value for speed (0.5 = slow, 2 = faster)
      const driftOffset = Math.floor(phaseOffsetRef.current);

      // Calculate how many samples to display (use about 2-3 cycles worth)
      const samplesToDisplay = Math.min(
        Math.floor(dataArray.length / 2),
        dataArray.length - triggerPoint - driftOffset
      );

      // Draw waveform starting from trigger point with drift
      ctx.beginPath();
      ctx.strokeStyle = '#22D3EE'; // Bright cyan - pops against dark background!
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow effect
      ctx.shadowColor = '#22D3EE';
      ctx.shadowBlur = 10;

      for (let i = 0; i < samplesToDisplay; i++) {
        const dataIndex = triggerPoint + driftOffset + i;
        if (dataIndex >= dataArray.length) break;

        const x = (i / samplesToDisplay) * width;
        // Convert from -1 to 1 range to canvas coordinates
        const y = ((dataArray[dataIndex] + 1) / 2) * height;

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
