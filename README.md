# Synthualizer 🎵✨

A delightful, educational web app that makes music synthesis concepts tangible through real-time visualizations and playful interactions.

## Vision

Learn synthesis by seeing and hearing how each parameter affects sound. "Super cute" animations and visual feedback at every level make abstract concepts concrete and approachable.

## Features (Planned)

### Phase 1: MVP ✨
- Basic subtractive synth (oscillator + filter)
- Real-time waveform visualization
- Interactive controls (sliders, waveform selector)
- Simple musical keyboard

### Phase 2: Complete Subtractive Synth
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
bun install

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Documentation

- [DESIGN.md](./DESIGN.md) - Complete system architecture and specifications
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Visual design language and component styles
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Step-by-step implementation guide

## Development Progress

- [x] Design phase complete
- [ ] Phase 1: MVP (In Progress)
- [ ] Phase 2: Complete Subtractive Synth
- [ ] Phase 3: FM Synthesis
- [ ] Phase 4: Polish & Education

## License

MIT
