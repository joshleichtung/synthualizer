'use client';

import { useEffect, useRef } from 'react';

interface ADSRDisplayProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

/**
 * Visual display of ADSR envelope shape
 * Renders a canvas showing the envelope curve with gradient styling
 */
export function ADSRDisplay({ attack, decay, sustain, release }: ADSRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 10;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate time segments (normalize to total width)
    const totalTime = attack + decay + 0.5 + release; // 0.5s for sustain display
    const attackWidth = (attack / totalTime) * drawWidth;
    const decayWidth = (decay / totalTime) * drawWidth;
    const sustainWidth = (0.5 / totalTime) * drawWidth;
    const releaseWidth = (release / totalTime) * drawWidth;

    // Calculate positions
    const startX = padding;
    const startY = padding + drawHeight;
    const attackX = startX + attackWidth;
    const decayX = attackX + decayWidth;
    const sustainX = decayX + sustainWidth;
    const releaseX = sustainX + releaseWidth;

    const peakY = padding;
    const sustainY = padding + drawHeight * (1 - sustain);

    // Draw envelope curve
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    // Attack: linear to peak
    ctx.lineTo(attackX, peakY);

    // Decay: exponential curve to sustain
    if (decay > 0.001) {
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = attackX + decayWidth * t;
        // Exponential decay curve
        const expT = Math.pow(t, 2);
        const y = peakY + (sustainY - peakY) * expT;
        ctx.lineTo(x, y);
      }
    } else {
      ctx.lineTo(decayX, sustainY);
    }

    // Sustain: hold level
    ctx.lineTo(sustainX, sustainY);

    // Release: exponential curve to zero
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = sustainX + releaseWidth * t;
      // Exponential release curve
      const expT = Math.pow(t, 2);
      const y = sustainY + (startY - sustainY) * expT;
      ctx.lineTo(x, y);
    }

    // Style the line with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, 'rgb(255, 127, 127)'); // coral-pink
    gradient.addColorStop(1, 'rgb(181, 152, 255)'); // purple-soft

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Fill area under curve with gradient
    ctx.lineTo(releaseX, startY);
    ctx.lineTo(startX, startY);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(0, 0, width, 0);
    fillGradient.addColorStop(0, 'rgba(255, 127, 127, 0.1)');
    fillGradient.addColorStop(1, 'rgba(181, 152, 255, 0.1)');
    ctx.fillStyle = fillGradient;
    ctx.fill();

    // Draw labels
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';

    if (attackWidth > 20) {
      ctx.fillText('A', startX + attackWidth / 2, startY + 20);
    }
    if (decayWidth > 20) {
      ctx.fillText('D', attackX + decayWidth / 2, startY + 20);
    }
    if (sustainWidth > 20) {
      ctx.fillText('S', decayX + sustainWidth / 2, startY + 20);
    }
    if (releaseWidth > 20) {
      ctx.fillText('R', sustainX + releaseWidth / 2, startY + 20);
    }
  }, [attack, decay, sustain, release]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Envelope Shape</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-lg bg-gray-50"
        style={{ width: '100%', height: '128px' }}
      />
    </div>
  );
}
