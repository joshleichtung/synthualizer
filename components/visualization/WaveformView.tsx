'use client';

import { useEffect, useRef } from 'react';

interface WaveformViewProps {
  analyser: AnalyserNode | null;
}

/**
 * Real-time waveform visualization using Canvas
 * Displays oscilloscope-style time-domain audio data
 */
export function WaveformView({ analyser }: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

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

    // Render loop - runs at ~60fps
    const render = () => {
      // Get time domain data from analyser
      analyser.getFloatTimeDomainData(dataArray);

      const { width, height } = canvas.getBoundingClientRect();

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(248, 249, 250, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = '#FF6B9D'; // Coral pink
      ctx.lineWidth = 2;

      for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * width;
        // Convert from -1 to 1 range to canvas coordinates
        const y = ((dataArray[i] + 1) / 2) * height;

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
