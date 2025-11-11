'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSynthStore } from '@/lib/stores/synthStore';
import { useAudioAmplitude, useEyeTracking } from './hooks';

/**
 * Linear interpolation helper
 */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Maximum pupil offset constant (moved outside component to prevent re-creation)
 */
const MAX_PUPIL_OFFSET = { x: 8, y: 6 };

/**
 * Animated cartoon eyes that:
 * - Look at controls when user interacts with them
 * - Blink faster based on audio amplitude
 * - Return to random movement when idle
 */
export function CartoonEyes() {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Get interaction state and engine from store
  const { lastInteraction, engine } = useSynthStore();

  // Monitor audio amplitude for reactive blinking
  const { averageAmplitude, isActive } = useAudioAmplitude(engine?.getAnalyser() || null);

  // Use refs to track amplitude without re-triggering effects
  const amplitudeRef = useRef(averageAmplitude);
  const isActiveRef = useRef(isActive);

  // Update refs when amplitude changes (doesn't trigger re-render)
  useEffect(() => {
    amplitudeRef.current = averageAmplitude;
    isActiveRef.current = isActive;
  }, [averageAmplitude, isActive]);

  // Eye tracking with maximum pupil offset
  const { eyePosition } = useEyeTracking({
    eyeContainerRef: leftEyeRef, // Use left eye as reference point
    targetPosition: lastInteraction.position,
    maxPupilOffset: MAX_PUPIL_OFFSET,
    returnToRandomAfterMs: 2000,
  });

  // Dynamic blink rate based on audio amplitude
  // Only re-initialize when engine changes, not on every amplitude update
  useEffect(() => {
    const baseBlinkInterval = 3000; // 3 seconds
    const minBlinkInterval = 800;   // Fast blink at high amplitude
    const maxBlinkInterval = 5000;  // Slow blink when quiet

    const calculateBlinkInterval = () => {
      // Read from refs to get current amplitude without re-triggering effect
      const amplitude = amplitudeRef.current;
      const active = isActiveRef.current;

      if (!active || amplitude < 0.01) {
        // Default blink rate when no audio
        return baseBlinkInterval + Math.random() * 2000;
      }

      // Invert: higher amplitude = faster blinks (lower interval)
      const normalized = Math.min(amplitude / 0.3, 1); // 0.3 is "loud"
      return lerp(maxBlinkInterval, minBlinkInterval, normalized);
    };

    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Blink duration
    };

    // Set up interval with dynamic timing
    let intervalId: NodeJS.Timeout;
    const scheduleBlink = () => {
      const interval = calculateBlinkInterval();
      intervalId = setTimeout(() => {
        blink();
        scheduleBlink(); // Schedule next blink
      }, interval);
    };

    // Start blinking after a short delay
    intervalId = setTimeout(scheduleBlink, 1000);

    return () => clearTimeout(intervalId);
  }, [engine]); // Only re-run when engine changes

  // Framer motion variants for smooth pupil movement
  const pupilVariants = {
    animate: {
      x: eyePosition.x,
      y: eyePosition.y,
      transition: {
        type: 'spring',
        stiffness: 150,
        damping: 20,
        mass: 0.5,
      },
    },
  };

  return (
    <div className="flex gap-12 justify-center items-center">
      {/* Left Eye */}
      <div
        ref={leftEyeRef}
        className="relative w-24 h-28 bg-white rounded-full shadow-lg overflow-hidden border-4 border-gray-800"
      >
        {!isBlinking ? (
          <motion.div
            className="absolute w-10 h-10 bg-gray-900 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
            }}
            variants={pupilVariants}
            animate="animate"
          >
            {/* Pupil highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full" />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0.1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-full h-1 bg-gray-900" />
          </motion.div>
        )}
      </div>

      {/* Right Eye */}
      <div
        ref={rightEyeRef}
        className="relative w-24 h-28 bg-white rounded-full shadow-lg overflow-hidden border-4 border-gray-800"
      >
        {!isBlinking ? (
          <motion.div
            className="absolute w-10 h-10 bg-gray-900 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
            }}
            variants={pupilVariants}
            animate="animate"
          >
            {/* Pupil highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full" />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0.1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-full h-1 bg-gray-900" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
