'use client';

import { useEffect, useState } from 'react';

/**
 * Animated cartoon eyes that look around and blink
 */
export function CartoonEyes() {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Random eye movement every 2-4 seconds
    const moveEyes = () => {
      const x = (Math.random() - 0.5) * 8; // -4 to 4 pixels
      const y = (Math.random() - 0.5) * 6; // -3 to 3 pixels
      setEyePosition({ x, y });
    };

    const eyeMoveInterval = setInterval(() => {
      moveEyes();
    }, 2000 + Math.random() * 2000); // 2-4 seconds

    // Blink every 3-5 seconds
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Blink duration
    }, 3000 + Math.random() * 2000); // 3-5 seconds

    return () => {
      clearInterval(eyeMoveInterval);
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <div className="flex gap-12 justify-center items-center">
      {/* Left Eye */}
      <div className="relative w-24 h-28 bg-white rounded-full shadow-lg overflow-hidden border-4 border-gray-800">
        {!isBlinking ? (
          <div
            className="absolute w-10 h-10 bg-gray-900 rounded-full transition-all duration-300"
            style={{
              top: `calc(50% + ${eyePosition.y}px)`,
              left: `calc(50% + ${eyePosition.x}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pupil highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-gray-900" />
          </div>
        )}
      </div>

      {/* Right Eye */}
      <div className="relative w-24 h-28 bg-white rounded-full shadow-lg overflow-hidden border-4 border-gray-800">
        {!isBlinking ? (
          <div
            className="absolute w-10 h-10 bg-gray-900 rounded-full transition-all duration-300"
            style={{
              top: `calc(50% + ${eyePosition.y}px)`,
              left: `calc(50% + ${eyePosition.x}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pupil highlight */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-gray-900" />
          </div>
        )}
      </div>
    </div>
  );
}
