# Synthualizer 🎵✨

A delightful, educational web app that makes music synthesis concepts tangible through real-time visualizations and playful interactions.

## Vision

Learn synthesis by seeing and hearing how each parameter affects sound. "Super cute" animations and visual feedback at every level make abstract concepts concrete and approachable.

## Features

### Phase 1: MVP ✅ COMPLETE
- ✅ Basic subtractive synth (oscillator + filter)
- ✅ Real-time waveform visualization
- ✅ Interactive controls (sliders, waveform selector)
- ✅ Simple musical keyboard (C4-C5 octave)
- ✅ Multiple waveforms (sine, square, sawtooth, triangle)
- ✅ Filter controls (cutoff, resonance)
- ✅ Attack/release envelope
- ✅ Responsive design

### Phase 2: Complete Subtractive Synth (Planned)
- Full ADSR envelope (amplitude + filter)
- LFO with routing options
- Enhanced visualizations (spectrum, signal flow)
- Animated controls with micro-interactions
- Preset system

### Phase 3: FM Synthesis
- 4-operator FM engine
- 8 algorithm routing options
- FM-specific visualizations
- Per-operator controls

### Phase 4: Polish & Education
- "Super cute" design system
- Particle effects and spring animations
- Guided tour system
- Multi-level educational content

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Audio**: Web Audio API
- **Animations**: Framer Motion
- **Visualization**: Canvas API

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### How to Use

1. **Select a waveform**: Click one of the waveform buttons (Sine, Square, Saw, Triangle)
2. **Play a note**: Click and hold any key on the keyboard
3. **Adjust the filter**: Move the Cutoff and Resonance sliders while playing
4. **Watch the visualization**: See the waveform change in real-time

### Browser Compatibility

Works best in modern browsers with Web Audio API support:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Documentation

- [DESIGN.md](./DESIGN.md) - Complete system architecture and specifications
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design language and component styles
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Step-by-step implementation guide
- [TESTING.md](./TESTING.md) - Manual testing checklist and verification

## Development Progress

- [x] Design phase complete
- [x] **Phase 1: MVP ✨ COMPLETE**
  - [x] Project setup and configuration
  - [x] Audio context and synth engine
  - [x] State management with Zustand
  - [x] Canvas-based visualization
  - [x] Interactive controls and keyboard
  - [x] Testing and verification
- [ ] Phase 2: Complete Subtractive Synth
- [ ] Phase 3: FM Synthesis
- [ ] Phase 4: Polish & Education

## Live Demo

🎵 **Try it now**: [http://localhost:3001](http://localhost:3001) (when running locally)

Deploy to Vercel for a live demo:
```bash
vercel
```

## License

MIT
