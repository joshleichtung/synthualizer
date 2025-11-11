import { useEffect, useRef } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';

/**
 * QWERTY keyboard input hook for musical keyboard
 *
 * Layout (standard piano/DAW mapping):
 * Lower octave (current octave):
 *   White keys: Z X C V B N M
 *   Black keys: S D   G H J
 *
 * Upper octave (current octave + 1):
 *   White keys: Q W E R T Y U I
 *   Black keys: 2 3   5 6 7
 *
 * Special keys:
 *   Shift: Sustain pedal (hold notes)
 */

interface KeyMapping {
  [key: string]: {
    note: number;      // Semitone offset from C
    octaveOffset: number; // 0 for lower row, 1 for upper row
  };
}

// Standard piano keyboard layout (Ableton/FL Studio style)
const KEY_MAP: KeyMapping = {
  // Lower octave (white keys)
  'z': { note: 0, octaveOffset: 0 },  // C
  'x': { note: 2, octaveOffset: 0 },  // D
  'c': { note: 4, octaveOffset: 0 },  // E
  'v': { note: 5, octaveOffset: 0 },  // F
  'b': { note: 7, octaveOffset: 0 },  // G
  'n': { note: 9, octaveOffset: 0 },  // A
  'm': { note: 11, octaveOffset: 0 }, // B
  ',': { note: 12, octaveOffset: 0 }, // C (next octave)
  '.': { note: 14, octaveOffset: 0 }, // D
  '/': { note: 16, octaveOffset: 0 }, // E

  // Lower octave (black keys)
  's': { note: 1, octaveOffset: 0 },  // C#
  'd': { note: 3, octaveOffset: 0 },  // D#
  'g': { note: 6, octaveOffset: 0 },  // F#
  'h': { note: 8, octaveOffset: 0 },  // G#
  'j': { note: 10, octaveOffset: 0 }, // A#
  'l': { note: 13, octaveOffset: 0 }, // C# (next octave)
  ';': { note: 15, octaveOffset: 0 }, // D#

  // Upper octave (white keys)
  'q': { note: 0, octaveOffset: 1 },  // C
  'w': { note: 2, octaveOffset: 1 },  // D
  'e': { note: 4, octaveOffset: 1 },  // E
  'r': { note: 5, octaveOffset: 1 },  // F
  't': { note: 7, octaveOffset: 1 },  // G
  'y': { note: 9, octaveOffset: 1 },  // A
  'u': { note: 11, octaveOffset: 1 }, // B
  'i': { note: 12, octaveOffset: 1 }, // C (next octave)
  'o': { note: 14, octaveOffset: 1 }, // D
  'p': { note: 16, octaveOffset: 1 }, // E
  '[': { note: 17, octaveOffset: 1 }, // F
  ']': { note: 19, octaveOffset: 1 }, // G

  // Upper octave (black keys)
  '2': { note: 1, octaveOffset: 1 },  // C#
  '3': { note: 3, octaveOffset: 1 },  // D#
  '5': { note: 6, octaveOffset: 1 },  // F#
  '6': { note: 8, octaveOffset: 1 },  // G#
  '7': { note: 10, octaveOffset: 1 }, // A#
  '9': { note: 13, octaveOffset: 1 }, // C# (next octave)
  '0': { note: 15, octaveOffset: 1 }, // D#
};

/**
 * Custom hook for QWERTY keyboard musical input
 * Handles:
 * - Key press/release → noteOn/noteOff
 * - Shift key for sustain pedal behavior
 * - Key repeat prevention
 */
export function useKeyboardInput() {
  const { octave, noteOn, noteOff } = useSynthStore();

  // Track which keys are currently pressed (prevent key repeat)
  const pressedKeys = useRef<Set<string>>(new Set());

  // Track which notes are sustained (held by Shift key)
  const sustainedNotes = useRef<Set<number>>(new Set());

  // Track if Shift is currently held
  const shiftHeld = useRef<boolean>(false);

  useEffect(() => {
    /**
     * Convert key + octave to frequency
     */
    const getFrequency = (note: number, octaveOffset: number): number => {
      const baseOctave = octave + octaveOffset;
      const baseC = 16.35; // C0
      const semitone = baseOctave * 12 + note;
      return baseC * Math.pow(2, semitone / 12);
    };

    /**
     * Handle keydown events
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Handle Shift key (sustain pedal)
      if (key === 'shift') {
        shiftHeld.current = true;
        return;
      }

      // Ignore if key is already pressed (prevent key repeat)
      if (pressedKeys.current.has(key)) {
        return;
      }

      // Check if this is a musical key
      const mapping = KEY_MAP[key];
      if (!mapping) {
        return; // Not a musical key, ignore
      }

      // Prevent default browser behavior for musical keys
      e.preventDefault();

      // Calculate frequency
      const frequency = getFrequency(mapping.note, mapping.octaveOffset);

      // Mark key as pressed
      pressedKeys.current.add(key);

      // Trigger note
      noteOn(frequency, 1);
    };

    /**
     * Handle keyup events
     */
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Handle Shift key release (release all sustained notes)
      if (key === 'shift') {
        shiftHeld.current = false;

        // Release all sustained notes
        sustainedNotes.current.forEach(frequency => {
          noteOff(frequency);
        });
        sustainedNotes.current.clear();
        return;
      }

      // Check if this is a musical key
      const mapping = KEY_MAP[key];
      if (!mapping) {
        return;
      }

      // Mark key as released
      pressedKeys.current.delete(key);

      // Calculate frequency
      const frequency = getFrequency(mapping.note, mapping.octaveOffset);

      // If Shift is held, sustain the note (don't release yet)
      if (shiftHeld.current) {
        sustainedNotes.current.add(frequency);
      } else {
        // Normal release
        noteOff(frequency);
      }
    };

    // Attach event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      // Release all notes on unmount
      pressedKeys.current.clear();
      sustainedNotes.current.forEach(frequency => {
        noteOff(frequency);
      });
      sustainedNotes.current.clear();
    };
  }, [octave, noteOn, noteOff]);
}
