'use client';

/**
 * Simple cartoon nose positioned between the eyes
 * Static triangle element with subtle shadow for depth
 */
export function CartoonNose() {
  return (
    <div className="flex justify-center -mt-2 mb-4">
      <div className="relative w-8 h-6">
        <svg viewBox="0 0 40 30" className="w-full h-full filter drop-shadow-md">
          <path
            d="M20 5 L35 25 L5 25 Z"
            fill="rgba(17, 24, 39, 0.6)"
            stroke="rgba(17, 24, 39, 0.8)"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
