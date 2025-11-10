# Synthualizer Implementation Guide

## Getting Started

This guide provides a step-by-step implementation path for building Synthualizer, organized by phases with clear milestones.

---

## Phase 1: Foundation (MVP) - Detailed Breakdown

**Goal**: Basic functional synth with visualization
**Estimated Time**: 2-3 days (hackathon pace) or 1-2 weeks (relaxed pace)

### Step 1.1: Project Setup (30 minutes)

```bash
# Create Next.js project with TypeScript and Tailwind
cd ~/projects/synthualizer
bun create next-app . --typescript --tailwind --app

# Install dependencies
bun add zustand framer-motion
bun add -d @types/web-audio-api

# Optional: Add shadcn/ui
bunx shadcn-ui@latest init
```

**File structure to create:**
```
synthualizer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── synth/
│   ├── controls/
│   └── visualization/
├── lib/
│   ├── audio/
│   └── stores/
└── types/
```

**Verify setup:**
- Run `bun dev` and confirm Next.js loads
- Tailwind CSS works
- TypeScript has no errors

---

### Step 1.2: Audio Context Setup (30 minutes)

**File: `lib/audio/audioContext.ts`**

```typescript
/**
 * Global audio context manager
 * Handles audio context lifecycle and provides singleton access
 */

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  // Resume if suspended (required by browser autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

export function closeAudioContext(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
```

**File: `types/synth.ts`**

```typescript
export interface ISynthEngine {
  start(frequency: number, velocity?: number): void;
  stop(): void;
  updateParameter(param: string, value: number): void;
  connect(destination: AudioNode): void;
  disconnect(): void;
  getAnalyser(): AnalyserNode;
}

export interface SubtractiveSynthParams {
  // Oscillator
  waveform: OscillatorType;
  detune: number;

  // Filter
  filterType: BiquadFilterType;
  cutoff: number;
  resonance: number;

  // Basic envelope (just attack and release for MVP)
  attack: number;
  release: number;
}
```

**Test:** Create a simple test in a page component that plays a tone on click.

---

### Step 1.3: Basic Synth Engine (1-2 hours)

**File: `lib/audio/engines/SubtractiveEngine.ts`**

```typescript
import { getAudioContext } from '../audioContext';
import { ISynthEngine, SubtractiveSynthParams } from '@/types/synth';

export class SubtractiveEngine implements ISynthEngine {
  private audioContext: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private filterNode: BiquadFilterNode;
  private analyser: AnalyserNode;
  private isPlaying: boolean = false;

  constructor() {
    this.audioContext = getAudioContext();

    // Create persistent nodes
    this.gainNode = this.audioContext.createGain();
    this.filterNode = this.audioContext.createBiquadFilter();
    this.analyser = this.audioContext.createAnalyser();

    // Set defaults
    this.gainNode.gain.value = 0;
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 1000;
    this.filterNode.Q.value = 1;

    // Configure analyser
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    // Connect audio graph
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  start(frequency: number, velocity: number = 1): void {
    const now = this.audioContext.currentTime;

    // Create new oscillator (can't reuse stopped oscillators)
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sawtooth'; // Default waveform
    this.oscillator.frequency.value = frequency;

    // Connect oscillator
    this.oscillator.connect(this.filterNode);
    this.oscillator.start(now);

    // Attack envelope
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(velocity * 0.5, now + 0.05); // 50ms attack for MVP

    this.isPlaying = true;
  }

  stop(): void {
    if (!this.oscillator) return;

    const now = this.audioContext.currentTime;

    // Release envelope
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.3); // 300ms release

    // Stop oscillator after release
    this.oscillator.stop(now + 0.3);
    this.oscillator = null;
    this.isPlaying = false;
  }

  updateParameter(param: string, value: number): void {
    const now = this.audioContext.currentTime;

    switch (param) {
      case 'cutoff':
        this.filterNode.frequency.linearRampToValueAtTime(value, now + 0.05);
        break;
      case 'resonance':
        this.filterNode.Q.linearRampToValueAtTime(value, now + 0.05);
        break;
      case 'waveform':
        if (this.oscillator) {
          this.oscillator.type = value as OscillatorType;
        }
        break;
      case 'filterType':
        this.filterNode.type = value as BiquadFilterType;
        break;
    }
  }

  connect(destination: AudioNode): void {
    this.analyser.connect(destination);
  }

  disconnect(): void {
    this.analyser.disconnect();
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }
}
```

**Test:**
- Create instance
- Call `start(440)` - should hear A4 note
- Call `updateParameter('cutoff', 200)` - sound should become muffled
- Call `stop()` - sound should fade out

---

### Step 1.4: State Management (1 hour)

**File: `lib/stores/synthStore.ts`**

```typescript
import { create } from 'zustand';
import { SubtractiveEngine } from '@/lib/audio/engines/SubtractiveEngine';

interface SynthState {
  // Engine instance
  engine: SubtractiveEngine | null;

  // Current parameters
  cutoff: number;
  resonance: number;
  waveform: OscillatorType;

  // Audio state
  isPlaying: boolean;
  currentNote: number | null;

  // Actions
  initializeEngine: () => void;
  triggerNote: (frequency: number) => void;
  releaseNote: () => void;
  updateCutoff: (value: number) => void;
  updateResonance: (value: number) => void;
  setWaveform: (waveform: OscillatorType) => void;
}

export const useSynthStore = create<SynthState>((set, get) => ({
  engine: null,
  cutoff: 1000,
  resonance: 1,
  waveform: 'sawtooth',
  isPlaying: false,
  currentNote: null,

  initializeEngine: () => {
    const engine = new SubtractiveEngine();
    set({ engine });
  },

  triggerNote: (frequency: number) => {
    const { engine } = get();
    if (!engine) return;

    engine.start(frequency);
    set({ isPlaying: true, currentNote: frequency });
  },

  releaseNote: () => {
    const { engine } = get();
    if (!engine) return;

    engine.stop();
    set({ isPlaying: false, currentNote: null });
  },

  updateCutoff: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('cutoff', value);
    set({ cutoff: value });
  },

  updateResonance: (value: number) => {
    const { engine } = get();
    engine?.updateParameter('resonance', value);
    set({ resonance: value });
  },

  setWaveform: (waveform: OscillatorType) => {
    const { engine } = get();
    engine?.updateParameter('waveform', waveform);
    set({ waveform });
  },
}));
```

---

### Step 1.5: Basic Visualization (2 hours)

**File: `components/visualization/WaveformView.tsx`**

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface WaveformViewProps {
  analyser: AnalyserNode | null;
}

export function WaveformView({ analyser }: WaveformViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const dataArray = new Float32Array(analyser.fftSize);

    // Set canvas size to match display size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render loop
    const render = () => {
      analyser.getFloatTimeDomainData(dataArray);

      const { width, height } = canvas.getBoundingClientRect();

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(248, 249, 250, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = '#FF6B9D'; // Coral pink
      ctx.lineWidth = 2;

      for (let i = 0; i < dataArray.length; i++) {
        const x = (i / dataArray.length) * width;
        const y = ((dataArray[i] + 1) / 2) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
}
```

**File: `components/visualization/VisualizationContainer.tsx`**

```typescript
'use client';

import { WaveformView } from './WaveformView';

interface VisualizationContainerProps {
  analyser: AnalyserNode | null;
}

export function VisualizationContainer({ analyser }: VisualizationContainerProps) {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-coral-pink/5 to-purple-soft/5 rounded-2xl overflow-hidden border-2 border-gray-100">
      <WaveformView analyser={analyser} />
    </div>
  );
}
```

---

### Step 1.6: Basic Controls (2 hours)

**File: `components/controls/SimpleSlider.tsx`**

```typescript
'use client';

interface SimpleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function SimpleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = ''
}: SimpleSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm text-gray-500">
          {value}{unit}
        </span>
      </div>

      <div className="relative h-2">
        <div className="absolute inset-0 bg-gray-200 rounded-full" />
        <div
          className="absolute h-full bg-gradient-to-r from-coral-pink to-purple-soft rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
```

**File: `components/controls/WaveformSelector.tsx`**

```typescript
'use client';

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (waveform: OscillatorType) => void;
}

const waveforms: Array<{ type: OscillatorType; label: string }> = [
  { type: 'sine', label: 'Sine' },
  { type: 'square', label: 'Square' },
  { type: 'sawtooth', label: 'Saw' },
  { type: 'triangle', label: 'Triangle' },
];

export function WaveformSelector({ value, onChange }: WaveformSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Waveform
      </label>
      <div className="grid grid-cols-4 gap-2">
        {waveforms.map((wf) => (
          <button
            key={wf.type}
            onClick={() => onChange(wf.type)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${value === wf.type
                ? 'bg-coral-pink text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {wf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Step 1.7: Simple Keyboard (1 hour)

**File: `components/synth/SimpleKeyboard.tsx`**

```typescript
'use client';

interface SimpleKeyboardProps {
  onNoteOn: (frequency: number) => void;
  onNoteOff: () => void;
}

// Simple chromatic scale starting at C4
const notes = [
  { note: 'C4', frequency: 261.63 },
  { note: 'D4', frequency: 293.66 },
  { note: 'E4', frequency: 329.63 },
  { note: 'F4', frequency: 349.23 },
  { note: 'G4', frequency: 392.00 },
  { note: 'A4', frequency: 440.00 },
  { note: 'B4', frequency: 493.88 },
  { note: 'C5', frequency: 523.25 },
];

export function SimpleKeyboard({ onNoteOn, onNoteOff }: SimpleKeyboardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Keyboard</h3>
      <div className="flex gap-2">
        {notes.map((note) => (
          <button
            key={note.note}
            onMouseDown={() => onNoteOn(note.frequency)}
            onMouseUp={onNoteOff}
            onMouseLeave={onNoteOff}
            className="
              flex-1 py-8 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100
              border-2 border-gray-300 hover:border-coral-pink
              active:bg-coral-pink active:text-white
              transition-all
              text-sm font-medium
            "
          >
            {note.note}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Step 1.8: Integrate Everything (1 hour)

**File: `app/page.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { useSynthStore } from '@/lib/stores/synthStore';
import { VisualizationContainer } from '@/components/visualization/VisualizationContainer';
import { SimpleSlider } from '@/components/controls/SimpleSlider';
import { WaveformSelector } from '@/components/controls/WaveformSelector';
import { SimpleKeyboard } from '@/components/synth/SimpleKeyboard';

export default function Home() {
  const {
    engine,
    cutoff,
    resonance,
    waveform,
    initializeEngine,
    triggerNote,
    releaseNote,
    updateCutoff,
    updateResonance,
    setWaveform,
  } = useSynthStore();

  useEffect(() => {
    initializeEngine();
  }, [initializeEngine]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Synthualizer
          </h1>
          <p className="text-gray-600">
            Learn synthesis through visualization
          </p>
        </header>

        {/* Visualization */}
        <VisualizationContainer analyser={engine?.getAnalyser() || null} />

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Oscillator Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold">Oscillator</h2>
            <WaveformSelector value={waveform} onChange={setWaveform} />
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold">Filter</h2>
            <SimpleSlider
              label="Cutoff"
              value={cutoff}
              min={20}
              max={20000}
              step={10}
              onChange={updateCutoff}
              unit="Hz"
            />
            <SimpleSlider
              label="Resonance"
              value={resonance}
              min={0.1}
              max={20}
              step={0.1}
              onChange={updateResonance}
              unit="Q"
            />
          </div>
        </div>

        {/* Keyboard */}
        <SimpleKeyboard
          onNoteOn={triggerNote}
          onNoteOff={releaseNote}
        />
      </div>
    </main>
  );
}
```

---

### Step 1.9: Testing & Polish (1 hour)

**Checklist:**
- [ ] Audio plays without clicks or pops
- [ ] Visualization updates smoothly at 60fps
- [ ] Controls respond immediately
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari
- [ ] Mobile responsive (at least functional)

**Common issues:**
- Audio context suspended: Add "Click to start" button
- Visualization not smooth: Check canvas size and devicePixelRatio
- Parameters not updating: Verify Zustand store subscriptions

---

## Phase 1 Complete! 🎉

At this point you should have:
- ✅ Functional subtractive synth (oscillator + filter)
- ✅ Real-time waveform visualization
- ✅ Basic controls (sliders, waveform selector)
- ✅ Simple keyboard to play notes
- ✅ State management working

**Demo video checklist:**
1. Show waveform changing as you play notes
2. Adjust cutoff and watch waveform change
3. Switch waveforms and hear the difference
4. Show resonance adding character

---

## Phase 2: Subtractive Synth Complete

### Key additions:
1. **Full ADSR Envelope**
   - Interactive ADSR graph component
   - Amplitude and filter envelopes
   - Visual playback indicator

2. **LFO System**
   - Rate and depth controls
   - Target selection (pitch, filter, amp)
   - LFO waveform selector

3. **Enhanced Visualizations**
   - Frequency spectrum view
   - Signal flow diagram
   - Switchable modes

4. **Preset System**
   - Load/save presets
   - Educational descriptions
   - Preset browser

5. **Animated Controls**
   - Replace sliders with knobs
   - Add micro-interactions
   - Particle effects

**Estimated time**: 3-5 days

---

## Phase 3: FM Synth

### Key additions:
1. **FM Engine**
   - 4 operator architecture
   - 8 algorithm routing options
   - Per-operator envelopes

2. **FM Controls**
   - Operator panels (ratio, level, envelope)
   - Algorithm selector with visual
   - Feedback control

3. **FM Visualizations**
   - Operator relationship diagram
   - Harmonic spectrum analysis
   - Animated modulation paths

**Estimated time**: 4-6 days

---

## Phase 4: Polish & Education

### Key additions:
1. **Design Polish**
   - Implement full design system
   - Add all micro-interactions
   - Particle systems
   - Spring animations

2. **Educational Content**
   - Guided tour system
   - Multi-level tooltips
   - Concept explainers
   - A/B comparison tools

3. **Performance Optimization**
   - Canvas rendering optimization
   - Audio worklet consideration
   - Bundle size optimization

**Estimated time**: 3-5 days

---

## Development Tips

### Audio Debugging
```typescript
// Add to audio engine for debugging
logAudioGraph() {
  console.log('Audio Context State:', this.audioContext.state);
  console.log('Sample Rate:', this.audioContext.sampleRate);
  console.log('Current Time:', this.audioContext.currentTime);
  console.log('Filter Frequency:', this.filterNode.frequency.value);
  console.log('Gain Value:', this.gainNode.gain.value);
}
```

### Performance Monitoring
```typescript
// Add to visualization component
useEffect(() => {
  let frameCount = 0;
  let lastTime = performance.now();

  const measureFPS = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${frameCount}`);
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(measureFPS);
  };

  measureFPS();
}, []);
```

### Hot Reloading Audio
Be careful with hot reloading and audio context:
- Audio context may need to be closed/recreated
- Oscillators can't be reused once stopped
- Store audio state in refs, not state (for performance)

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

### Environment Setup
- Ensure Web Audio API is supported (all modern browsers)
- Test on mobile (iOS Safari may have restrictions)
- Add analytics (Vercel Analytics, Plausible, etc.)

---

## Next Steps

After completing Phase 1, decide:
1. Continue to Phase 2 (complete subtractive synth)
2. Jump to Phase 4 (polish what you have)
3. Start Phase 3 (add FM synth)

For a hackathon: Focus on Phase 1 + visual polish (Phase 4 elements)
For a learning tool: Complete Phase 2, add education (Phase 4)
For a portfolio piece: All phases, emphasize unique visualizations

---

## Resources

### Web Audio API
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Book](https://webaudioapi.com/book/)

### Synthesis Theory
- [Sound on Sound Synth Secrets](https://www.soundonsound.com/series/synth-secrets)
- [Learning Synths by Ableton](https://learningsynths.ableton.com/)

### Visualization
- [Canvas API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### Inspiration
- [Tone.js Examples](https://tonejs.github.io/examples/)
- [Chrome Music Lab](https://musiclab.chromeexperiments.com/)

---

Good luck building Synthualizer! 🎵✨
