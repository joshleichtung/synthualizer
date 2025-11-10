'use client';

import { InteractiveControl } from '@/components/controls/InteractiveControl';

interface SimpleKeyboardProps {
  onNoteToggle: (frequency: number | null) => void;
  activeFrequency: number | null;
  octave: number;
}

/**
 * Simple musical keyboard with one octave
 * Toggle mode: Click to start/stop notes
 */
export function SimpleKeyboard({ onNoteToggle, activeFrequency, octave }: SimpleKeyboardProps) {
  // Base frequencies for C (multiply by 2^octave to get the actual frequency)
  const baseFrequencies = {
    'C': 16.35,
    'D': 18.35,
    'E': 20.60,
    'F': 21.83,
    'G': 24.50,
    'A': 27.50,
    'B': 30.87,
  };

  // Generate notes for the current octave
  const notes = Object.entries(baseFrequencies).map(([name, baseFreq]) => {
    const frequency = baseFreq * Math.pow(2, octave);
    return {
      note: `${name}${octave}`,
      frequency,
      name,
    };
  });

  const handleNoteClick = (frequency: number) => {
    // Toggle: if this note is playing, stop it; otherwise start it
    if (activeFrequency === frequency) {
      onNoteToggle(null);
    } else {
      onNoteToggle(frequency);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Keyboard</h3>
        <p className="text-xs text-gray-500">Click to toggle notes</p>
      </div>

      <div className="flex gap-2">
        {notes.map((note) => {
          const isActive = activeFrequency === note.frequency;

          return (
            <InteractiveControl key={note.note} controlId={`keyboard-note-${note.note}`}>
              <button
                onClick={() => handleNoteClick(note.frequency)}
                className={`
                  flex-1 py-8 rounded-lg
                  border-2 transition-all select-none
                  ${
                    isActive
                      ? 'bg-coral-pink text-white border-coral-dark shadow-glow-coral'
                      : 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 hover:border-coral-pink hover:shadow-md'
                  }
                  text-sm font-medium
                  hover:scale-105 active:scale-95
                `}
                aria-label={`${isActive ? 'Stop' : 'Play'} ${note.note}`}
                aria-pressed={isActive}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base">{note.name}</span>
                  <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-50'}`}>
                    {Math.round(note.frequency)}Hz
                  </span>
                </div>
              </button>
            </InteractiveControl>
          );
        })}
      </div>

      {/* Instruction hint */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Tip: Click a note to toggle it on/off. Adjust controls while playing!
      </p>
    </div>
  );
}
