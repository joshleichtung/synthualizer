'use client';

import { useState } from 'react';

interface SimpleKeyboardProps {
  onNoteOn: (frequency: number) => void;
  onNoteOff: () => void;
}

/**
 * Simple musical keyboard with one octave
 * Supports mouse/touch interaction and visual feedback
 */
export function SimpleKeyboard({ onNoteOn, onNoteOff }: SimpleKeyboardProps) {
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Notes from C4 to C5 (one octave)
  const notes = [
    { note: 'C4', frequency: 261.63, name: 'C' },
    { note: 'D4', frequency: 293.66, name: 'D' },
    { note: 'E4', frequency: 329.63, name: 'E' },
    { note: 'F4', frequency: 349.23, name: 'F' },
    { note: 'G4', frequency: 392.00, name: 'G' },
    { note: 'A4', frequency: 440.00, name: 'A' },
    { note: 'B4', frequency: 493.88, name: 'B' },
    { note: 'C5', frequency: 523.25, name: 'C' },
  ];

  const handleNoteStart = (note: string, frequency: number) => {
    setActiveNote(note);
    onNoteOn(frequency);
  };

  const handleNoteEnd = () => {
    setActiveNote(null);
    onNoteOff();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Keyboard</h3>
        <p className="text-xs text-gray-500">Click and hold to play</p>
      </div>

      <div className="flex gap-2">
        {notes.map((note) => (
          <button
            key={note.note}
            onMouseDown={() => handleNoteStart(note.note, note.frequency)}
            onMouseUp={handleNoteEnd}
            onMouseLeave={handleNoteEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              handleNoteStart(note.note, note.frequency);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleNoteEnd();
            }}
            className={`
              flex-1 py-8 rounded-lg
              border-2 transition-all select-none
              ${
                activeNote === note.note
                  ? 'bg-coral-pink text-white border-coral-dark shadow-glow-coral scale-95'
                  : 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 hover:border-coral-pink hover:shadow-md'
              }
              text-sm font-medium
              active:scale-95
            `}
            aria-label={`Play ${note.note}`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-base">{note.name}</span>
              <span className={`text-xs ${activeNote === note.note ? 'opacity-80' : 'opacity-50'}`}>
                {Math.round(note.frequency)}Hz
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Instruction hint */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Tip: Adjust the cutoff and resonance while playing to hear the filter in action
      </p>
    </div>
  );
}
