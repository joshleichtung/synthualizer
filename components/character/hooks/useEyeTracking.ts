import { useEffect, useState, RefObject } from 'react';

interface EyeTrackingOptions {
  eyeContainerRef: RefObject<HTMLDivElement>;
  targetPosition: { x: number; y: number } | null;
  maxPupilOffset: { x: number; y: number };
  returnToRandomAfterMs?: number;
}

interface EyeTrackingResult {
  eyePosition: { x: number; y: number };
  mode: 'tracking' | 'random';
}

/**
 * Hook for calculating eye gaze direction based on target position
 * Handles smooth tracking of controls and returns to random movement when idle
 */
export function useEyeTracking({
  eyeContainerRef,
  targetPosition,
  maxPupilOffset,
  returnToRandomAfterMs = 2000,
}: EyeTrackingOptions): EyeTrackingResult {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<'tracking' | 'random'>('random');

  // Calculate gaze direction from eye center to target
  useEffect(() => {
    if (!targetPosition || !eyeContainerRef.current) {
      setMode((prev) => prev === 'random' ? prev : 'random');
      return;
    }

    setMode((prev) => prev === 'tracking' ? prev : 'tracking');

    const eyeRect = eyeContainerRef.current.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Vector from eye to target
    const dx = targetPosition.x - eyeCenterX;
    const dy = targetPosition.y - eyeCenterY;

    // Calculate angle and distance
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize to max pupil offset (eyes can't look too far)
    const normalizedDistance = Math.min(1, distance / 500); // 500px = full pupil offset

    // Limit vertical movement to 60% for more natural appearance
    const verticalLimiter = 0.6;
    const offsetX = Math.cos(angle) * maxPupilOffset.x * normalizedDistance;
    const offsetY = Math.sin(angle) * maxPupilOffset.y * normalizedDistance * verticalLimiter;

    setEyePosition({ x: offsetX, y: offsetY });

    // Return to random after timeout
    const timeout = setTimeout(() => {
      setMode('random');
    }, returnToRandomAfterMs);

    return () => clearTimeout(timeout);
  }, [targetPosition, eyeContainerRef, maxPupilOffset, returnToRandomAfterMs]);

  // Random eye movement when not tracking
  useEffect(() => {
    if (mode !== 'random') return;

    const moveEyes = () => {
      const x = (Math.random() - 0.5) * maxPupilOffset.x;
      const y = (Math.random() - 0.5) * maxPupilOffset.y;
      setEyePosition({ x, y });
    };

    const interval = setInterval(moveEyes, 2000 + Math.random() * 2000);
    moveEyes(); // Initial position

    return () => clearInterval(interval);
  }, [mode, maxPupilOffset]);

  return { eyePosition, mode };
}
