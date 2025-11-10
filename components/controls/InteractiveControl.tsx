'use client';

import { ReactNode, useCallback, useRef } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';

interface InteractiveControlProps {
  children: ReactNode;
  controlId: string;
  className?: string;
}

/**
 * Wrapper component that tracks user interactions with controls
 * Enables reactive character eyes that look at controls when user interacts
 *
 * Usage:
 * <InteractiveControl controlId="cutoff-slider">
 *   <YourControl />
 * </InteractiveControl>
 */
export function InteractiveControl({
  children,
  controlId,
  className,
}: InteractiveControlProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setInteraction, clearInteraction } = useSynthStore();

  const handleInteraction = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setInteraction(controlId, { x: centerX, y: centerY });
  }, [controlId, setInteraction]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleInteraction}
      onMouseDown={handleInteraction}
      onFocus={handleInteraction}
      onTouchStart={handleInteraction}
      onBlur={clearInteraction}
    >
      {children}
    </div>
  );
}
