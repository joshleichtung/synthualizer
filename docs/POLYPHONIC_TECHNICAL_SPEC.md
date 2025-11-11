# Technical Specification: 6-Voice Polyphonic Architecture

**Project:** Synthualizer - Character-based Visual Synthesizer
**Feature:** Polyphonic Voice Architecture + QWERTY Keyboard Input
**Author:** Claude Code + Josh
**Date:** 2025-11-10
**Status:** Design Phase

---

## Executive Summary

Refactor the Synthualizer from monophonic toggle/drone architecture to **6-voice polyphonic** synthesis with QWERTY keyboard input. This enables proper ADSR envelope articulation, chord playing, and sets foundation for advanced modulation features.

---

## Current Architecture (Monophonic)

### SubtractiveEngine
```
Single Oscillator → Filter → Gain (ADSR) → Analyser → Output
```

### FMEngine
```
Modulator Osc → Mod Gain ──┐
                             ├→ Carrier.frequency
Carrier Osc ────────────────┘ → Gain (ADSR) → Analyser → Output
```

### Limitations
- Toggle-based: One note at a time, sustains indefinitely
- ADSR never completes full cycle naturally
- No chord playing capability
- Shift+QWERTY interaction would be meaningless

---

## New Architecture (6-Voice Polyphonic)

### Core Principle
**Voice Pool Pattern:** Pre-allocate 6 voice objects, allocate on note-on, release on note-off, steal when pool exhausted.

### Voice Interface

```typescript
interface Voice {
  // Identity & State
  id: number;                    // Voice index (0-5)
  active: boolean;               // Is voice currently playing?
  frequency: number | null;      // Current note frequency (Hz)
  noteStartTime: number;         // AudioContext time when note started

  // Audio Nodes (Subtractive)
  oscillator: OscillatorNode | null;
  voiceGain: GainNode;           // Per-voice ADSR envelope

  // Audio Nodes (FM - additional)
  modulatorOsc: OscillatorNode | null;
  modulatorGain: GainNode;       // Modulation depth
}
```

### Signal Flow

#### Subtractive (6 voices)
```
Voice 0: Osc → VoiceGain (ADSR) ──┐
Voice 1: Osc → VoiceGain (ADSR) ──┤
Voice 2: Osc → VoiceGain (ADSR) ──┤
Voice 3: Osc → VoiceGain (ADSR) ──┼→ Mixer → Filter → Master → Analyser → Output
Voice 4: Osc → VoiceGain (ADSR) ──┤
Voice 5: Osc → VoiceGain (ADSR) ──┘
```

#### FM (6 voices)
```
Voice 0: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┐
Voice 1: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┤
Voice 2: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┼→ Mixer → Master → Analyser
Voice 3: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┤
Voice 4: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┤
Voice 5: Mod→ModGain→Carrier.freq, Carrier→VoiceGain ──┘
```

**Note:** Filter is removed from per-voice path to keep voices independent. Filter can be added as master effect later if desired.

---

## Voice Allocation Algorithm

### NoteOn(frequency)

```typescript
function noteOn(frequency: number, velocity: number = 1): Voice {
  // 1. Check if note already playing (re-trigger)
  let voice = activeNotes.get(frequency);
  if (voice) {
    // Re-trigger: Stop current, restart with new attack
    stopVoiceOscillators(voice);
    startVoiceOscillators(voice, frequency);
    triggerAttack(voice, velocity);
    return voice;
  }

  // 2. Find free voice
  voice = voices.find(v => !v.active);
  if (voice) {
    allocateVoice(voice, frequency, velocity);
    return voice;
  }

  // 3. Voice stealing: steal oldest active voice
  voice = voices.reduce((oldest, current) =>
    current.noteStartTime < oldest.noteStartTime ? current : oldest
  );

  // Trigger release on stolen voice (polite stealing)
  triggerRelease(voice);

  // Allocate stolen voice to new note
  allocateVoice(voice, frequency, velocity);
  return voice;
}

function allocateVoice(voice: Voice, frequency: number, velocity: number) {
  voice.active = true;
  voice.frequency = frequency;
  voice.noteStartTime = audioContext.currentTime;

  startVoiceOscillators(voice, frequency);
  activeNotes.set(frequency, voice);
  triggerAttack(voice, velocity);
}
```

### NoteOff(frequency)

```typescript
function noteOff(frequency: number): void {
  const voice = activeNotes.get(frequency);
  if (!voice) return;

  triggerRelease(voice);
  activeNotes.delete(frequency);

  // Voice stays "active" during release phase
  // Mark inactive after release time
  setTimeout(() => {
    voice.active = false;
    voice.frequency = null;
  }, releaseTime * 1000 + 100);
}
```

### ADSR Envelope (Per-Voice)

```typescript
function triggerAttack(voice: Voice, velocity: number) {
  const now = audioContext.currentTime;
  const peakGain = velocity * 0.5;
  const sustainGain = Math.max(peakGain * sustainLevel, 0.001);

  // Cancel any existing automation
  voice.voiceGain.gain.cancelScheduledValues(now);

  // Attack
  voice.voiceGain.gain.setValueAtTime(0, now);
  voice.voiceGain.gain.linearRampToValueAtTime(peakGain, now + attackTime);

  // Decay
  const decayStartTime = now + attackTime;
  if (decayTime > 0.001) {
    if (sustainGain >= 0.01) {
      voice.voiceGain.gain.exponentialRampToValueAtTime(
        sustainGain,
        decayStartTime + decayTime
      );
    } else {
      voice.voiceGain.gain.linearRampToValueAtTime(
        sustainGain,
        decayStartTime + decayTime
      );
    }
  }

  // Sustain phase: hold at sustainGain (no automation needed)
}

function triggerRelease(voice: Voice) {
  const now = audioContext.currentTime;
  const currentGain = voice.voiceGain.gain.value;

  // Cancel scheduled automation
  voice.voiceGain.gain.cancelScheduledValues(now);
  voice.voiceGain.gain.setValueAtTime(currentGain, now);

  // Release
  voice.voiceGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + releaseTime
  );

  // Stop oscillators after release
  setTimeout(() => {
    stopVoiceOscillators(voice);
  }, releaseTime * 1000 + 100);
}
```

---

## QWERTY Keyboard Input

### Key Mapping (2-Octave Layout)

```typescript
const KEY_TO_NOTE_OFFSET: Record<string, number> = {
  // Bottom row (white keys) - C3 to C4
  'z': 0,  'x': 2,  'c': 4,  'v': 5,  'b': 7,  'n': 9,  'm': 11, ',': 12,

  // Home row (white keys) - C4 to C5
  'a': 12, 's': 14, 'd': 16, 'f': 17, 'g': 19, 'h': 21, 'j': 23, 'k': 24,

  // Top row (black keys)
  'q': 1,  'w': 3,  'e': 6,  'r': 8,  't': 10,  // C# to A#
  'y': 13, 'u': 15, 'i': 18, 'o': 20, 'p': 22,  // C# to A#
};

// Calculate frequency from key
function keyToFrequency(key: string): number | null {
  const offset = KEY_TO_NOTE_OFFSET[key];
  if (offset === undefined) return null;

  const baseFrequency = 16.35; // C0
  const semitone = offset + (currentOctave * 12);
  return baseFrequency * Math.pow(2, semitone / 12);
}
```

### Keyboard Event Handling

```typescript
// State
const pressedKeys = new Set<string>();      // Currently held physical keys
const sustainedNotes = new Set<number>();   // Notes held by Shift sustain
let shiftHeld = false;

// Event listeners
document.addEventListener('keydown', (e) => {
  // Prevent key repeat
  if (e.repeat) return;

  // Handle Shift
  if (e.key === 'Shift') {
    shiftHeld = true;
    return;
  }

  // Handle note keys
  const key = e.key.toLowerCase();
  if (pressedKeys.has(key)) return;

  const frequency = keyToFrequency(key);
  if (!frequency) return;

  pressedKeys.add(key);
  engine.noteOn(frequency);

  // Visual feedback: highlight on-screen key
  highlightKey(frequency);
});

document.addEventListener('keyup', (e) => {
  // Handle Shift release
  if (e.key === 'Shift') {
    shiftHeld = false;
    // Release all sustained notes
    sustainedNotes.forEach(freq => engine.noteOff(freq));
    sustainedNotes.clear();
    return;
  }

  // Handle note keys
  const key = e.key.toLowerCase();
  pressedKeys.delete(key);

  const frequency = keyToFrequency(key);
  if (!frequency) return;

  // If Shift held, sustain note instead of releasing
  if (shiftHeld) {
    sustainedNotes.add(frequency);
  } else {
    engine.noteOff(frequency);
  }

  // Visual feedback: un-highlight on-screen key
  unhighlightKey(frequency);
});
```

### Focus Management

```typescript
// Prevent keyboard input from being blocked by input fields
useEffect(() => {
  const handleGlobalKeydown = (e: KeyboardEvent) => {
    // Don't capture if user is typing in an input
    if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Prevent browser shortcuts that conflict
    if (KEY_TO_NOTE_OFFSET[e.key.toLowerCase()]) {
      e.preventDefault();
    }
  };

  document.addEventListener('keydown', handleGlobalKeydown);
  return () => document.removeEventListener('keydown', handleGlobalKeydown);
}, []);
```

---

## State Management Changes

### synthStore.ts Updates

```typescript
interface SynthState {
  // ... existing state ...

  // New polyphony state
  activeVoices: number;           // Current count of active voices (0-6)
  sustainedNotes: Set<number>;    // Notes being sustained by Shift

  // Modified actions
  noteOn: (frequency: number, velocity?: number) => void;
  noteOff: (frequency: number) => void;
  // Remove: toggleNote (replaced by noteOn/noteOff)
}
```

---

## Engine Refactoring

### SubtractiveEngine Changes

#### Before (Monophonic)
```typescript
class SubtractiveEngine {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;

  start(frequency: number, velocity: number) {
    // Create single oscillator
    // Trigger envelope
  }

  stop() {
    // Stop single oscillator
  }
}
```

#### After (Polyphonic)
```typescript
class SubtractiveEngine {
  private voices: Voice[] = [];              // Pool of 6 voices
  private activeNotes: Map<number, Voice> = new Map();
  private mixer: GainNode;                   // Mix all voices

  constructor() {
    // Create 6 voices
    for (let i = 0; i < 6; i++) {
      this.voices.push(this.createVoice(i));
    }
  }

  private createVoice(id: number): Voice {
    const voiceGain = this.audioContext.createGain();
    voiceGain.gain.value = 0;
    voiceGain.connect(this.mixer);

    return {
      id,
      active: false,
      frequency: null,
      noteStartTime: 0,
      oscillator: null,
      voiceGain,
    };
  }

  noteOn(frequency: number, velocity: number = 1) {
    // Voice allocation logic (see above)
  }

  noteOff(frequency: number) {
    // Release logic (see above)
  }

  getActiveVoiceCount(): number {
    return this.voices.filter(v => v.active).length;
  }
}
```

### FMEngine Changes

Similar refactoring but each voice needs:
- `carrierOsc: OscillatorNode`
- `modulatorOsc: OscillatorNode`
- `modulatorGain: GainNode`
- `voiceGain: GainNode`

---

## Visual Enhancements

### Voice Count → Eyebrow Animation

```typescript
// In CartoonEyes component
const activeVoices = useSynthStore(state => state.activeVoices);

// Map voice count to eyebrow angle/intensity
const eyebrowAngle = 0 + (activeVoices * 5); // 0° to 30°
const eyebrowThickness = 2 + (activeVoices * 0.5); // 2px to 5px

<motion.div
  className="eyebrow"
  animate={{
    rotate: eyebrowAngle,
    borderWidth: eyebrowThickness,
  }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
/>
```

### QWERTY Key Highlighting

```typescript
// Visual feedback when QWERTY key pressed
function highlightKey(frequency: number) {
  const keyButton = findKeyButtonByFrequency(frequency);
  if (keyButton) {
    keyButton.classList.add('keyboard-triggered');
  }
}

// CSS
.keyboard-triggered {
  box-shadow: 0 0 20px rgba(100, 200, 255, 0.8);
  border-color: rgb(100, 200, 255);
}
```

---

## Performance Considerations

### CPU Usage
- 6 voices × 1 oscillator (subtractive) = **6 oscillator nodes** (very cheap)
- 6 voices × 2 oscillators (FM) = **12 oscillator nodes** (still cheap)
- Per-voice gain automation = **6 gain nodes with automation** (negligible)
- **Total:** ~20 audio nodes max, well within browser capabilities

### Memory
- Voice pool pre-allocated: ~1-2KB per voice = **~12KB total**
- Oscillators created on-demand, destroyed after release
- No memory leaks as long as oscillators properly disconnected

### Optimization Strategies
- **Voice stealing:** Prevents unlimited voice allocation
- **Lazy oscillator creation:** Only create OscillatorNode on noteOn
- **Cleanup timeout:** Ensure oscillators disconnected after release + 100ms buffer

---

## Testing Strategy

### Unit Tests
- [ ] Voice allocation: Free voice selection
- [ ] Voice allocation: Voice stealing when pool full
- [ ] Voice allocation: Re-trigger same note
- [ ] ADSR: Full cycle (attack → decay → sustain → release)
- [ ] ADSR: Interrupted envelope (noteOff during attack/decay)
- [ ] Keyboard: Key mapping correctness
- [ ] Keyboard: Shift sustain behavior
- [ ] Keyboard: Key repeat prevention

### Integration Tests
- [ ] Play single note, verify waveform visible
- [ ] Play chord (3 notes), verify mixed waveform
- [ ] Press 7 keys (over limit), verify voice stealing
- [ ] Shift+chord, release Shift, verify all notes release
- [ ] Switch octave while playing, verify frequency changes

### Manual Testing
- [ ] Play melody, verify smooth note transitions
- [ ] Play chords, verify no clicks/pops
- [ ] Voice stealing sounds natural (no abrupt cutoffs)
- [ ] QWERTY keyboard feels responsive (<50ms latency)
- [ ] Visual feedback (eyebrows, key highlights) works
- [ ] Works in Chrome, Firefox, Safari

---

## Migration Path

### Phase 1: Engine Refactoring
1. Create Voice interface
2. Refactor SubtractiveEngine to use voice pool
3. Implement noteOn/noteOff methods
4. Test with existing UI (on-screen keyboard)

### Phase 2: QWERTY Input
1. Create KeyboardInput component
2. Implement key mapping and event handlers
3. Integrate with store (noteOn/noteOff actions)
4. Add visual feedback (key highlighting)

### Phase 3: Visual Enhancements
1. Add eyebrow component (if not exists)
2. Map voice count to eyebrow animation
3. Add voice count indicator UI
4. Polish animations

### Phase 4: FM Engine
1. Apply same voice pool pattern to FMEngine
2. Test FM polyphony
3. Ensure feature parity with SubtractiveEngine

---

## Edge Cases & Gotchas

### Browser Focus
- Keyboard input doesn't work if window loses focus
- **Solution:** Show visual indicator when window unfocused

### Key Repeat
- OS key repeat can re-trigger notes
- **Solution:** Track `pressedKeys` Set, check `e.repeat` flag

### Shift Key Conflicts
- Browser shortcuts (Shift+key) might interfere
- **Solution:** `e.preventDefault()` on music keys

### Voice Stealing During Release
- Stealing a voice during release phase can cause click
- **Solution:** "Polite stealing" - trigger release before re-allocating

### AudioContext Suspend
- Browser suspends AudioContext when tab backgrounded
- **Solution:** Resume AudioContext on focus, release all notes on blur

### Overlapping Envelopes
- Rapid re-triggering can cause envelope overlap
- **Solution:** Always `cancelScheduledValues()` before new automation

---

## Future Enhancements

1. **LFO Modulation**
   - Per-voice LFO or global LFO
   - Route to pitch, filter, amplitude
   - Visualize with uvula vibration

2. **Portamento/Glide**
   - Smooth pitch transitions between notes
   - Mono mode toggle (disables polyphony, enables portamento)

3. **Arpeggiator**
   - Pattern-based note sequencing
   - Visualize as rapid waveform changes

4. **Voice Priority Modes**
   - Low-note priority
   - High-note priority
   - Last-note priority

5. **Per-Voice Filter**
   - Move filter to voice path for richer polyphony
   - Increases CPU usage but more "analog poly" sound

6. **MIDI Input**
   - Web MIDI API support
   - Use MIDI keyboard instead of QWERTY

---

## Success Metrics

- [ ] 6 simultaneous notes play without glitches
- [ ] Keyboard latency <50ms (perceived as instant)
- [ ] Voice stealing is inaudible (smooth transitions)
- [ ] ADSR envelopes complete full cycle naturally
- [ ] CPU usage <10% on modern hardware
- [ ] Works across Chrome, Firefox, Safari
- [ ] Visual feedback feels responsive and connected to audio

---

## References

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Voice Allocation Algorithms](https://www.native-instruments.com/forum/threads/voice-allocation.339850/)
- [ADSR Envelope Best Practices](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch02.html)
- [Keyboard Event Handling](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)

---

**Status:** Ready for PRD and implementation planning.
