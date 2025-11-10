# Synthualizer - Music Synthesis Visualization App Design

## Vision

A delightful, educational web app that makes music synthesis concepts tangible through real-time visualizations and playful interactions. Users learn by seeing and hearing how each parameter affects sound, with "super cute" animations and visual feedback at every level.

## Core Concept

**Make the invisible visible**: Transform abstract synthesis concepts into concrete visual experiences that connect user actions → sound changes → visual feedback in an immediate, intuitive loop.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Controls   │  │ Visualizer   │  │  Education   │      │
│  │  Component   │  │  Component   │  │    Panel     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
└─────────┼──────────────────┼──────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│                      (Zustand Store)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ synthState │ audioState │ visualState │ uiState     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────┬────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Audio/Synthesis Engine Layer                │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Subtractive │  │   FM Synth   │  ← Web Audio API        │
│  │    Synth     │  │   Engine     │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + custom animated controls
- **State**: Zustand
- **Audio**: Web Audio API (native)
- **Animations**: Framer Motion
- **Visualization**: Canvas API (potentially WebGL for advanced effects)

---

## Component Architecture

### 1. Synthesis Engine Layer

#### Base Synth Interface
```typescript
interface ISynthEngine {
  // Core methods
  start(frequency: number, velocity: number): void;
  stop(): void;
  updateParameter(param: string, value: number): void;

  // Audio context
  connect(destination: AudioNode): void;
  disconnect(): void;

  // Analysis
  getAnalyser(): AnalyserNode;
  getCurrentWaveform(): Float32Array;
  getFrequencyData(): Uint8Array;
}
```

#### Subtractive Synth Architecture
```
Oscillator → Filter → Envelope → Output
    ↑          ↑         ↑
    └──── LFO ─┴─────────┘
```

**Components:**
- **Oscillator**: Multiple waveform types (sine, square, saw, triangle)
- **Filter**: Biquad filter (low-pass, high-pass, band-pass) with cutoff & resonance
- **Envelope**: ADSR for amplitude and filter modulation
- **LFO**: Low-frequency modulation source (rate, depth, target)

**Parameters:**
```typescript
interface SubtractiveSynthParams {
  // Oscillator
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  detune: number; // -100 to 100 cents

  // Filter
  filterType: 'lowpass' | 'highpass' | 'bandpass';
  cutoff: number; // 20-20000 Hz
  resonance: number; // 0-20 Q

  // Amplitude Envelope
  attack: number; // 0-2s
  decay: number; // 0-2s
  sustain: number; // 0-1
  release: number; // 0-5s

  // Filter Envelope
  filterEnvAmount: number; // -100 to 100
  filterAttack: number;
  filterDecay: number;
  filterSustain: number;
  filterRelease: number;

  // LFO
  lfoRate: number; // 0-20 Hz
  lfoDepth: number; // 0-100
  lfoTarget: 'pitch' | 'filter' | 'amplitude';
}
```

#### FM Synth Architecture
```
Operator 1 ──┐
             ├──> Algorithm Router ──> Output
Operator 2 ──┤
             │
Operator 3 ──┘
(Operator 4 - optional)
```

**Algorithms** (DX7-inspired):
- Algorithm 1: Op1 → Op2 → Op3 → Output (serial modulation)
- Algorithm 2: (Op1 → Op2) + Op3 → Output (parallel + modulated)
- Algorithm 3: Op1 + Op2 + Op3 → Output (parallel additive)
- Algorithm 4: (Op1 → Op2) + (Op1 → Op3) → Output (split modulation)
- ...8 total algorithms

**Parameters:**
```typescript
interface FMSynthParams {
  algorithm: number; // 1-8

  operators: Array<{
    ratio: number; // 0.5, 1, 2, 3, 4... (harmonic ratios)
    level: number; // 0-100 (volume/mod depth)
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    waveform: 'sine' | 'square' | 'saw' | 'triangle';
  }>;

  feedback: number; // 0-100 (operator self-modulation)
}
```

---

### 2. Visualization Layer

#### Visualization Manager
```typescript
interface VisualizationMode {
  id: string;
  name: string;
  render(ctx: CanvasRenderingContext2D, audioData: AudioData, synthState: SynthState): void;
}
```

#### Visualization Modes

**1. Waveform View** (Primary for Subtractive)
- Real-time oscilloscope display
- Color-coded signal path stages:
  - Blue: Raw oscillator output
  - Purple: After filter
  - Orange: After envelope
- Shows filter cutoff as a translucent overlay
- Envelope shape displayed as background

**2. Frequency Spectrum** (Primary for FM)
- FFT-based frequency analysis
- Shows harmonic content in real-time
- Highlights fundamental and modulation sidebands
- Color intensity shows amplitude

**3. Signal Flow Diagram** (Contextual)
- Animated node graph showing synthesis chain
- Glowing connections show signal strength
- Nodes pulse with audio amplitude
- For FM: Shows operator routing with modulation depth

**4. Parameter Space** (Advanced/Fun)
- Abstract visualization mapping parameters to visual space
- Particle systems responding to sound
- Morphing shapes based on timbre
- "Super cute" animations and creatures

#### Visualization Rendering System
```typescript
class VisualizationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private analyser: AnalyserNode;
  private animationFrameId: number;

  private waveformData: Float32Array;
  private frequencyData: Uint8Array;

  startRenderLoop(): void {
    const render = () => {
      this.analyser.getFloatTimeDomainData(this.waveformData);
      this.analyser.getByteFrequencyData(this.frequencyData);

      this.activeMode.render(this.ctx, {
        waveform: this.waveformData,
        frequency: this.frequencyData,
        parameters: this.synthState
      });

      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }
}
```

---

### 3. Control Layer

#### Interactive Controls

**Control Types:**
1. **Knob**: Rotary control for continuous parameters (cutoff, resonance, etc.)
2. **Slider**: Linear control for envelopes and levels
3. **Selector**: Discrete options (waveform, filter type, algorithm)
4. **Pad**: XY controller for multi-parameter control
5. **Keyboard**: Musical keyboard for note input

#### Control Animation System

Each control has built-in visual feedback:

```typescript
interface ControlAnimations {
  // On interaction start
  onStart: {
    scale: 1.05; // Slight grow
    glow: 'var(--accent-color)'; // Colored glow
    haptic: 'light'; // Visual "bounce"
  };

  // During interaction
  onMove: {
    trail: true; // Leave colorful trail
    particles: 'sparkles'; // Emit particles
    ripple: true; // Ripple effect from control
  };

  // On interaction end
  onEnd: {
    scale: 1.0;
    settle: 'spring'; // Bouncy spring animation
    glow: 'fade'; // Fade out glow
  };

  // Continuous feedback
  valueIndicator: {
    colorMap: 'gradient'; // Color changes with value
    numericDisplay: true; // Show value tooltip
    rangeGlow: true; // Extremes glow more
  };
}
```

**Knob Component Example:**
- Rotating dial with value arc
- Current value displayed in center
- Wobbles slightly when adjusted
- Leaves faint trail during fast movements
- Glows at extreme values (high resonance = bright glow)
- Emits small sparkles when changed

**ADSR Envelope Visualizer:**
- Interactive breakpoint graph
- Drag handles to adjust stages
- Shows current envelope position during playback
- Animated "ball" travels through envelope shape
- Color-coded stages (Attack=green, Decay=yellow, Sustain=blue, Release=red)

---

### 4. State Management

#### Zustand Store Structure

```typescript
// stores/synthStore.ts
interface SynthStore {
  // Current synth type
  synthType: 'subtractive' | 'fm';

  // Synth-specific parameters
  subtractiveSynth: SubtractiveSynthParams;
  fmSynth: FMSynthParams;

  // Audio state
  audio: {
    isPlaying: boolean;
    currentNote: number | null;
    contextState: 'suspended' | 'running' | 'closed';
    masterVolume: number;
  };

  // Visualization state
  visualization: {
    activeMode: string;
    showSignalFlow: boolean;
    colorScheme: 'pastel' | 'vibrant' | 'dark';
    animationIntensity: number; // 0-100
  };

  // UI state
  ui: {
    activeControl: string | null;
    showTooltips: boolean;
    educationLevel: 'beginner' | 'intermediate' | 'advanced';
    showParameterValues: boolean;
  };

  // Actions
  updateParameter: (param: string, value: number) => void;
  triggerNote: (frequency: number, velocity: number) => void;
  releaseNote: () => void;
  switchSynthType: (type: 'subtractive' | 'fm') => void;
  setVisualizationMode: (mode: string) => void;
}
```

#### Data Flow

```
User Interaction
      ↓
  [Control Component]
      ↓
  Store Action (updateParameter)
      ↓
  ┌─────────────┴─────────────┐
  ↓                           ↓
[Audio Engine Update]    [UI Re-render]
  ↓                           ↓
Audio Param Ramp        Control Animation
  ↓                           ↓
[Analyser Node]         Visualization Update
  ↓
requestAnimationFrame loop
```

**Key principle**: Audio updates are decoupled from React render cycle to maintain 60fps animations and avoid audio glitches.

---

## UI/UX Design System

### Visual Design Language

**"Super Cute" Aesthetic:**
- **Color Palette**: Soft pastels or vibrant gradients
  - Primary: Warm coral/pink (#FF6B9D)
  - Secondary: Soft purple (#C687F0)
  - Accent: Bright yellow (#FFD93D)
  - Background: Off-white (#F8F9FA) or deep navy for dark mode

- **Typography**:
  - Headers: Rounded, friendly sans-serif (e.g., Nunito, Quicksand)
  - Body: Clear, readable (e.g., Inter, SF Pro)

- **Shapes**:
  - Rounded corners everywhere (16px+ radius)
  - Soft drop shadows (subtle, colorful)
  - Organic, flowing shapes (not rigid grids)

- **Animations**:
  - Spring physics (react-spring or Framer Motion)
  - Bouncy, playful timing functions
  - Micro-interactions on every element
  - Particles, sparkles, glows

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                    Top Navigation                    │
│  [Logo] [Subtractive|FM] [Presets▾] [Help] [Info]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│              ┌───────────────────┐                  │
│              │                   │                  │
│              │   Visualization   │                  │
│              │     Canvas        │                  │
│              │    (Large)        │                  │
│              │                   │                  │
│              └───────────────────┘                  │
│                                                     │
├─────────────────┬───────────────────┬───────────────┤
│                 │                   │               │
│   Oscillator    │      Filter       │   Envelope    │
│   Controls      │     Controls      │   Controls    │
│                 │                   │               │
│  [Waveform]     │  [Type]           │  [ADSR Graph] │
│  [Detune]       │  [Cutoff Knob]    │               │
│                 │  [Res Knob]       │               │
│                 │                   │               │
├─────────────────┴───────────────────┴───────────────┤
│                                                     │
│           [Musical Keyboard / Note Trigger]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Responsive Considerations:**
- Desktop: Full layout with large visualizer
- Tablet: Stacked sections, medium visualizer
- Mobile: Simplified single-column, focus on one control section at a time

### Interaction Patterns

**1. Parameter Adjustment:**
- Hover → Control highlights with glow
- Click/Drag → Immediate visual feedback (wobble, particles)
- Value change → Audio updates smoothly, visualization responds
- Release → Settle animation with spring physics

**2. Synth Type Switching:**
- Smooth cross-fade between layouts
- Morphing animations (controls slide/fade)
- Visualization transitions to appropriate mode
- Educational tooltip explains new synth type

**3. Preset Loading:**
- Parameter values animate to new positions
- "Journey" animation showing parameter changes
- Brief description of preset's character
- Sound preview auto-plays

**4. Educational Tooltips:**
- Hover on control → Icon appears
- Click icon → Contextual explanation
- Adjustable detail level (beginner/intermediate/advanced)
- Can show "before/after" waveforms

---

## Educational Layer

### Multi-Level Learning System

**Level 1: Beginner (Metaphors)**
- "Filter is like a blanket over speakers"
- "Resonance makes one frequency ring out"
- "Attack is how quickly the sound starts"
- Simple, relatable language

**Level 2: Intermediate (Technical but Accessible)**
- "Low-pass filter removes high frequencies"
- "Resonance emphasizes the cutoff frequency"
- "Attack time controls envelope rise"
- Accurate but friendly explanations

**Level 3: Advanced (Detailed Technical)**
- "12dB/octave low-pass filter with resonant peak"
- "Q factor of 0.7-20 controls resonance bandwidth"
- "Exponential attack curve with time constant"
- Full technical detail

### Learning Features

**1. Guided Tour Mode:**
- Step-by-step walkthrough of synthesis concepts
- Interactive challenges ("Make this sound bassy")
- Progressive unlocking of controls
- Celebration animations on completion

**2. Preset Library with Descriptions:**
```typescript
interface Preset {
  name: string;
  description: string;
  educationalNote: string; // What makes this sound unique
  parameters: SynthParams;
  tags: string[]; // 'bass', 'lead', 'pad', etc.
}

// Example:
{
  name: "Warm Sub Bass",
  description: "Deep, round bass with gentle harmonics",
  educationalNote: "Low cutoff frequency (100Hz) removes higher harmonics, creating a sub-bass sound. High resonance adds character.",
  tags: ['bass', 'subtractive', 'beginner']
}
```

**3. Interactive Comparisons:**
- A/B switches to hear parameter changes
- "Before/After" visualization overlays
- Highlight changed parameters
- Explain why the change affects timbre

**4. Vocabulary Builder:**
- Glossary of synthesis terms
- In-context definitions
- Audio examples for each term
- Progressive terminology introduction

---

## Technical Specifications

### Audio Engine Implementation

**Web Audio Node Graph (Subtractive):**
```javascript
// Simplified structure
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();
const filterNode = audioContext.createBiquadFilter();
const analyser = audioContext.createAnalyser();

// LFO setup
const lfo = audioContext.createOscillator();
const lfoGain = audioContext.createGain();

// Connections
oscillator.connect(filterNode);
filterNode.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioContext.destination);

// LFO modulation
lfo.connect(lfoGain);
lfoGain.connect(filterNode.frequency); // Modulate filter cutoff
```

**Parameter Smoothing:**
```javascript
// Avoid zipper noise with smooth parameter changes
updateParameter(param: AudioParam, targetValue: number, rampTime: number = 0.05) {
  const now = this.audioContext.currentTime;
  param.cancelScheduledValues(now);
  param.setTargetAtTime(targetValue, now, rampTime);
}
```

**ADSR Envelope:**
```javascript
class ADSREnvelope {
  trigger(param: AudioParam, attack: number, decay: number, sustain: number) {
    const now = this.audioContext.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(0, now);
    param.linearRampToValueAtTime(1, now + attack);
    param.linearRampToValueAtTime(sustain, now + attack + decay);
  }

  release(param: AudioParam, release: number) {
    const now = this.audioContext.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(0, now + release);
  }
}
```

### Visualization Performance

**Optimization Strategies:**
1. **Use OffscreenCanvas** for heavy computations
2. **Throttle updates** to 60fps (requestAnimationFrame)
3. **Pre-compute** gradient lookups and color maps
4. **Batch draw calls** to minimize canvas state changes
5. **Use Web Workers** for FFT analysis if needed

**Canvas Drawing Pattern:**
```javascript
class WaveformVisualizer {
  render(waveformData: Float32Array, synthParams: SubtractiveSynthParams) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = this.getColorForParameter(synthParams.cutoff);
    ctx.lineWidth = 2;

    for (let i = 0; i < waveformData.length; i++) {
      const x = (i / waveformData.length) * width;
      const y = (waveformData[i] + 1) * height / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }
}
```

### State Synchronization

**Audio Thread → UI Thread Communication:**
```javascript
// Use SharedArrayBuffer or message passing for real-time data
// Avoid blocking the audio thread with UI updates

// In AudioWorklet (advanced):
class SynthProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    // Audio processing here

    // Send analysis data to main thread
    this.port.postMessage({
      rms: this.calculateRMS(outputs[0]),
      peak: this.calculatePeak(outputs[0])
    });

    return true;
  }
}
```

---

## File Structure

```
synthualizer/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main synth page
│   └── globals.css                # Global styles + Tailwind
│
├── components/
│   ├── synth/
│   │   ├── SynthContainer.tsx     # Main synth orchestrator
│   │   ├── SubtractiveSynth.tsx   # Subtractive UI
│   │   └── FMSynth.tsx            # FM synth UI
│   │
│   ├── controls/
│   │   ├── Knob.tsx               # Animated rotary knob
│   │   ├── Slider.tsx             # Animated slider
│   │   ├── Selector.tsx           # Button group selector
│   │   ├── ADSRGraph.tsx          # Interactive envelope
│   │   └── XYPad.tsx              # 2D parameter control
│   │
│   ├── visualization/
│   │   ├── VisualizationCanvas.tsx # Main canvas component
│   │   ├── WaveformView.tsx        # Oscilloscope mode
│   │   ├── SpectrumView.tsx        # FFT spectrum mode
│   │   ├── SignalFlowView.tsx      # Node graph mode
│   │   └── ParticleView.tsx        # Fun abstract mode
│   │
│   ├── education/
│   │   ├── Tooltip.tsx             # Contextual help
│   │   ├── GuidedTour.tsx          # Interactive tutorial
│   │   └── ConceptExplainer.tsx    # Deep-dive explanations
│   │
│   └── ui/
│       └── * (shadcn/ui components)
│
├── lib/
│   ├── audio/
│   │   ├── engines/
│   │   │   ├── BaseEngine.ts          # Common synth interface
│   │   │   ├── SubtractiveEngine.ts   # Subtractive implementation
│   │   │   └── FMEngine.ts            # FM implementation
│   │   │
│   │   ├── nodes/
│   │   │   ├── ADSREnvelope.ts        # Envelope generator
│   │   │   ├── LFO.ts                 # Low-frequency oscillator
│   │   │   └── MultiVoice.ts          # Polyphony manager
│   │   │
│   │   └── audioContext.ts            # Global audio context
│   │
│   ├── visualization/
│   │   ├── VisualizationManager.ts    # Mode switching
│   │   ├── renderers/
│   │   │   ├── WaveformRenderer.ts
│   │   │   ├── SpectrumRenderer.ts
│   │   │   └── ParticleRenderer.ts
│   │   │
│   │   └── utils/
│   │       ├── colorMaps.ts           # Color palettes
│   │       └── animations.ts          # Animation helpers
│   │
│   ├── stores/
│   │   └── synthStore.ts              # Zustand state
│   │
│   └── presets/
│       ├── subtractivePresets.ts      # Preset definitions
│       └── fmPresets.ts
│
├── public/
│   └── images/                         # Icons, graphics
│
└── types/
    ├── synth.ts                        # Synth-related types
    └── visualization.ts                # Viz-related types
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
**Goal**: Basic functional synth with visualization

**Features:**
- ✅ Next.js + TypeScript + Tailwind setup
- ✅ Basic subtractive synth engine (oscillator + filter)
- ✅ Simple waveform visualization
- ✅ Basic knob and slider controls
- ✅ Musical keyboard input
- ✅ State management with Zustand

**Success criteria**: Can play notes, adjust filter, see waveform change

---

### Phase 2: Subtractive Synth Complete
**Goal**: Full-featured subtractive synth with polished UX

**Features:**
- ✅ Complete ADSR envelope (amplitude + filter)
- ✅ LFO with routing options
- ✅ Enhanced visualization modes (spectrum, signal flow)
- ✅ Animated controls with visual feedback
- ✅ Preset system
- ✅ Basic educational tooltips

**Success criteria**: Can create variety of classic synth sounds

---

### Phase 3: FM Synth
**Goal**: Add FM synthesis capabilities

**Features:**
- ✅ FM synth engine with 4 operators
- ✅ 8 algorithm routing options
- ✅ FM-specific visualization (operator graph, spectrum)
- ✅ Ratio and level controls for each operator
- ✅ FM preset library
- ✅ Algorithm visualization

**Success criteria**: Can create bell-like and complex FM timbres

---

### Phase 4: Polish & Education
**Goal**: Enhance visual appeal and educational value

**Features:**
- ✅ "Super cute" design system refinement
- ✅ Particle effects and micro-animations
- ✅ Guided tour system
- ✅ Multi-level educational content
- ✅ A/B comparison tools
- ✅ Concept explainer deep-dives
- ✅ Sound preset showcase

**Success criteria**: App is delightful to use, genuinely educational

---

### Phase 5: Advanced Features (Future)
**Ideas for expansion:**
- Effects chain (reverb, delay, distortion)
- Modulation matrix
- Sequencer/arpeggiator
- Additional synth types (wavetable, granular)
- Preset sharing/community
- MIDI input support
- Export audio clips
- Mobile app version

---

## Key Design Decisions

### 1. Why Web Audio API over Tone.js?
- **Pro**: Direct control over audio graph
- **Pro**: Lower-level understanding for educational purposes
- **Pro**: Better performance for custom visualizations
- **Con**: More code to write
- **Decision**: Use Web Audio API directly, but create clean abstractions

### 2. Why Canvas over SVG for Visualizations?
- **Pro**: Better performance for real-time 60fps rendering
- **Pro**: Easier to implement effects (trails, glows, particles)
- **Con**: Less accessible (but we're not relying on viz for critical info)
- **Decision**: Canvas for main visualizer, SVG for control UI elements

### 3. Why Zustand over Context API?
- **Pro**: Better performance (no unnecessary re-renders)
- **Pro**: Simpler mental model than Redux
- **Pro**: Easy to integrate with non-React audio code
- **Decision**: Zustand for all state management

### 4. Polyphony Strategy
- **Phase 1**: Monophonic (one note at a time)
- **Phase 2+**: Limited polyphony (4-8 voices)
- **Rationale**: Simpler audio engine, clearer visualization, sufficient for learning

### 5. Mobile Strategy
- **Primary**: Responsive web app (works on mobile browsers)
- **Future**: Consider Progressive Web App (PWA) for offline capability
- **Not planned**: Native mobile apps (too much maintenance)

---

## Success Metrics

### User Experience Goals:
- Users understand basic synthesis concepts after 15 minutes
- Every interaction produces immediate visual feedback (<16ms)
- "Delightful" interactions (sparkles, bounces, smooth animations)
- No audio glitches or lag (Web Audio API latency < 10ms)

### Technical Goals:
- Consistent 60fps animation framerate
- Web Audio API latency < 10ms
- Load time < 2s on 4G
- Accessibility (keyboard navigation, ARIA labels on controls)

### Educational Goals:
- Users can explain difference between filter types
- Users understand envelope impact on sound shape
- Users can create simple patches from scratch
- Preset library teaches by example

---

## Open Questions / Future Considerations

1. **Accessibility**: How to make audio visualizations accessible to deaf/HoH users?
   - Alternative haptic feedback representations?
   - Text descriptions of timbral changes?

2. **Performance**: Should we use AudioWorklet for the synth engines?
   - Pros: More precise timing, better performance
   - Cons: More complex, harder to debug

3. **Gamification**: Should we add achievements/challenges?
   - "Recreate this famous synth sound"
   - Unlock new parameters as users learn
   - Leaderboard for preset sharing?

4. **Social Features**: Preset sharing and community?
   - User-generated preset library
   - Voting/favoriting system
   - "Remix" other users' sounds

5. **Monetization** (if applicable):
   - Free tier with basic synths
   - Premium: Advanced synths, effects, more presets
   - Educational license for schools

---

## Conclusion

This design creates a comprehensive, educational music synthesis app that makes abstract concepts concrete through real-time visualizations and playful interactions. By combining solid audio engineering with delightful UX and progressive educational content, Synthualizer will help users develop genuine understanding of synthesis fundamentals.

The modular architecture allows for iterative development, starting with a solid foundation and expanding capabilities over time. The "super cute" aesthetic makes learning approachable and fun, removing intimidation often associated with synthesis.

**Next steps**: Begin Phase 1 implementation, starting with project scaffolding and basic audio engine.
