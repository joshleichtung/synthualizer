# Synthualizer Design System

## Visual Identity

### Color Palette

#### Light Mode (Primary)
```css
/* Primary Colors */
--coral-pink: #FF6B9D;      /* Main accent, CTA buttons */
--coral-light: #FFB3D1;     /* Hover states, highlights */
--coral-dark: #E5548B;      /* Active states */

/* Secondary Colors */
--soft-purple: #C687F0;     /* Secondary accent, info */
--lavender: #E5D4FF;        /* Backgrounds, subtle highlights */
--deep-purple: #9B5EC8;     /* Dark purple for depth */

/* Accent Colors */
--bright-yellow: #FFD93D;   /* Warnings, highlights, energy */
--sunshine: #FFF4C4;        /* Subtle highlights */

/* Neutrals */
--background: #F8F9FA;      /* Main background */
--surface: #FFFFFF;         /* Cards, panels */
--surface-elevated: #FFFFFF; /* Elevated elements (slight shadow) */
--text-primary: #2D3436;    /* Main text */
--text-secondary: #636E72;  /* Secondary text */
--border: #E1E8ED;          /* Borders, dividers */

/* Semantic Colors */
--success: #6BCF7F;         /* Success states */
--warning: #FFD93D;         /* Warning states */
--error: #FF6B6B;           /* Error states */
--info: #74B9FF;            /* Info states */
```

#### Dark Mode (Optional)
```css
/* Primary Colors (adjusted for dark) */
--coral-pink: #FF7FA8;
--coral-light: #FFA3C7;
--coral-dark: #E5639D;

/* Background */
--background: #1A1D23;
--surface: #252931;
--surface-elevated: #2F3541;
--text-primary: #E8EAED;
--text-secondary: #A0A4A8;
--border: #3F4551;
```

### Typography

#### Font Families
```css
/* Headers - Friendly, rounded */
--font-display: 'Nunito', 'Quicksand', system-ui, sans-serif;

/* Body - Clear, readable */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Technical values */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Section headings */
--text-3xl: 1.875rem;  /* 30px - Page headings */
--text-4xl: 2.25rem;   /* 36px - Hero text */
```

#### Font Weights
```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### Spacing System

```css
/* Base unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius

```css
--radius-sm: 8px;     /* Small elements, buttons */
--radius-md: 12px;    /* Cards, inputs */
--radius-lg: 16px;    /* Large panels */
--radius-xl: 24px;    /* Hero elements */
--radius-full: 9999px; /* Circular elements */
```

### Shadows

```css
/* Soft, colorful shadows for "cute" aesthetic */
--shadow-sm: 0 2px 8px rgba(255, 107, 157, 0.08);
--shadow-md: 0 4px 16px rgba(255, 107, 157, 0.12);
--shadow-lg: 0 8px 32px rgba(255, 107, 157, 0.16);
--shadow-xl: 0 16px 48px rgba(255, 107, 157, 0.20);

/* Glow effects for interactive elements */
--glow-coral: 0 0 24px rgba(255, 107, 157, 0.4);
--glow-purple: 0 0 24px rgba(198, 135, 240, 0.4);
--glow-yellow: 0 0 24px rgba(255, 217, 61, 0.4);
```

---

## Component Styles

### Buttons

#### Primary Button
```tsx
<button className="
  px-6 py-3
  bg-coral-pink text-white
  rounded-lg
  font-medium
  transition-all duration-200
  hover:bg-coral-dark hover:scale-105
  active:scale-95
  shadow-md hover:shadow-lg
">
  Primary Action
</button>
```

**Animation**: Scale on hover (1.05), bounce on click, subtle glow

#### Secondary Button
```tsx
<button className="
  px-6 py-3
  bg-white text-coral-pink
  border-2 border-coral-pink
  rounded-lg
  font-medium
  transition-all duration-200
  hover:bg-coral-light hover:border-coral-dark
  active:scale-95
">
  Secondary Action
</button>
```

### Knob Control

**Visual Design:**
- Circular dial (80px diameter)
- Outer ring shows value range with gradient fill
- Center circle shows current value text
- Rotation indicator (line from center to edge)
- Hover: Glow effect, slight scale (1.05)
- Active: Pulsing glow, particles emitted

```tsx
// Knob visual structure
<div className="knob-container">
  {/* Outer glow ring (animated) */}
  <div className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity bg-coral-pink/30" />

  {/* Value arc background */}
  <svg className="knob-track">
    <circle className="stroke-gray-200" />
    <circle className="stroke-coral-pink transition-all"
            strokeDashoffset={calculateDashOffset(value)} />
  </svg>

  {/* Center dial */}
  <div className="knob-dial absolute inset-2 rounded-full bg-white shadow-md flex items-center justify-center">
    <span className="text-sm font-semibold">{value}</span>
  </div>

  {/* Rotation indicator */}
  <div className="knob-indicator absolute top-1/2 left-1/2 w-0.5 h-8 bg-coral-pink origin-bottom transform -translate-x-1/2 -translate-y-full"
       style={{ rotate: `${angle}deg` }} />

  {/* Particle system (canvas overlay) */}
  <canvas className="particle-layer" />
</div>
```

**Interaction:**
- Drag to adjust (vertical or circular motion)
- Scroll wheel support
- Double-click to reset to default
- Right-click for fine adjustment mode

### Slider Control

**Visual Design:**
- Horizontal track with gradient fill
- Large, rounded thumb (24px)
- Value tooltip appears on interaction
- Leave faint trail during drag
- Glow at extreme values

```tsx
<div className="slider-container relative h-12 flex items-center">
  {/* Track background */}
  <div className="slider-track absolute h-2 w-full bg-gray-200 rounded-full" />

  {/* Filled portion (gradient) */}
  <div className="slider-fill absolute h-2 rounded-full bg-gradient-to-r from-coral-pink to-soft-purple"
       style={{ width: `${percentage}%` }} />

  {/* Thumb */}
  <div className="slider-thumb absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-coral-pink
                  transition-transform hover:scale-125 active:scale-110
                  cursor-grab active:cursor-grabbing"
       style={{ left: `${percentage}%` }}>
    {/* Glow effect when dragging */}
    <div className="absolute inset-0 rounded-full bg-coral-pink/30 blur-md opacity-0 active:opacity-100" />
  </div>

  {/* Value tooltip (shown on hover/drag) */}
  <div className="absolute -top-8 left-1/2 -translate-x-1/2
                  px-2 py-1 bg-gray-900 text-white text-xs rounded
                  opacity-0 group-hover:opacity-100 transition-opacity">
    {value}
  </div>
</div>
```

### ADSR Envelope Graph

**Visual Design:**
- Interactive breakpoint graph
- Four draggable handles (Attack, Decay, Sustain, Release)
- Color-coded stages
- Shows current position during playback
- Smooth bezier curves between points

```tsx
<div className="adsr-graph w-full h-40 relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
  {/* Background grid */}
  <svg className="absolute inset-0">
    <defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(229, 232, 237)" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>

  {/* Envelope path */}
  <svg className="absolute inset-0">
    <defs>
      <linearGradient id="envelopeGradient">
        <stop offset="0%" stopColor="#6BCF7F" />   {/* Attack - green */}
        <stop offset="33%" stopColor="#FFD93D" />  {/* Decay - yellow */}
        <stop offset="66%" stopColor="#74B9FF" />  {/* Sustain - blue */}
        <stop offset="100%" stopColor="#FF6B6B" /> {/* Release - red */}
      </linearGradient>
    </defs>

    <path d={envelopePath}
          fill="url(#envelopeGradient)"
          fillOpacity="0.2"
          stroke="url(#envelopeGradient)"
          strokeWidth="3" />
  </svg>

  {/* Draggable handles */}
  {handles.map((handle, i) => (
    <div key={i}
         className="absolute w-4 h-4 bg-white rounded-full border-2 shadow-md cursor-move
                    hover:scale-125 transition-transform"
         style={{
           left: handle.x,
           top: handle.y,
           borderColor: handle.color
         }}
         onMouseDown={(e) => startDrag(e, handle.id)}
    />
  ))}

  {/* Playback position indicator */}
  {isPlaying && (
    <div className="absolute top-0 bottom-0 w-0.5 bg-coral-pink shadow-glow-coral animate-pulse"
         style={{ left: `${playbackPosition}%` }} />
  )}
</div>
```

### Waveform Selector

**Visual Design:**
- Grid of waveform icons (sine, square, saw, triangle)
- Selected state with glow
- Hover preview plays brief tone
- Animated waveform icons (subtle movement)

```tsx
<div className="waveform-selector grid grid-cols-4 gap-3">
  {waveforms.map(waveform => (
    <button
      key={waveform.type}
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${selected === waveform.type
          ? 'border-coral-pink bg-coral-pink/10 shadow-glow-coral'
          : 'border-gray-200 hover:border-coral-light hover:bg-gray-50'
        }
      `}
      onClick={() => selectWaveform(waveform.type)}
      onMouseEnter={() => previewWaveform(waveform.type)}
    >
      {/* Waveform icon (SVG or Canvas) */}
      <WaveformIcon type={waveform.type} animated={true} />

      {/* Label */}
      <span className="block mt-2 text-xs font-medium text-center">
        {waveform.label}
      </span>

      {/* Selection indicator */}
      {selected === waveform.type && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-coral-pink rounded-full animate-pulse" />
      )}
    </button>
  ))}
</div>
```

---

## Animation System

### Spring Physics

Use Framer Motion for spring-based animations:

```tsx
import { motion } from 'framer-motion';

const springConfig = {
  type: "spring",
  stiffness: 300,
  damping: 20
};

// Bouncy button
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={springConfig}
>
  Click me!
</motion.button>
```

### Micro-interactions

#### Particle System
Emit particles on control interaction:
- Small colored circles (2-4px)
- Fade out over 0.5-1s
- Move in random directions with gravity
- 5-10 particles per interaction
- Color matches control accent

#### Ripple Effect
Expanding circle on click:
- Origin at click point
- Expands to 2x size
- Fades out simultaneously
- Duration: 0.6s

#### Trail Effect
Faint trail following slider thumb:
- SVG path tracking recent positions
- Gradient opacity (newest = opaque, oldest = transparent)
- Fades completely after 1s
- Color matches slider accent

### Transitions

```css
/* Default transition for most elements */
.transition-default {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Bouncy transition for playful elements */
.transition-bounce {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Smooth transition for values */
.transition-smooth {
  transition: all 0.3s ease-in-out;
}
```

---

## Layout Components

### Control Panel

```tsx
<motion.div
  className="control-panel bg-white rounded-xl p-6 shadow-lg"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
>
  {/* Panel header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-display font-bold text-gray-900">
      Oscillator
    </h3>
    <button className="text-sm text-coral-pink hover:text-coral-dark">
      <InfoIcon />
    </button>
  </div>

  {/* Panel content */}
  <div className="space-y-4">
    {children}
  </div>
</motion.div>
```

### Visualization Container

```tsx
<div className="visualization-container relative w-full h-96 bg-gradient-to-br from-coral-pink/5 to-soft-purple/5 rounded-2xl overflow-hidden border-2 border-gray-100">
  {/* Mode selector (top right) */}
  <div className="absolute top-4 right-4 z-10">
    <select className="px-3 py-2 bg-white/80 backdrop-blur rounded-lg border border-gray-200 text-sm">
      <option>Waveform</option>
      <option>Spectrum</option>
      <option>Signal Flow</option>
      <option>Particles</option>
    </select>
  </div>

  {/* Canvas for visualization */}
  <canvas ref={canvasRef} className="w-full h-full" />

  {/* Overlay info (bottom left) */}
  <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/60 backdrop-blur text-white text-xs rounded-lg">
    Frequency: {frequency}Hz | Cutoff: {cutoff}Hz
  </div>
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px) {  /* sm */ }
@media (min-width: 768px) {  /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Layout Adaptations

**Mobile (< 768px):**
- Single column layout
- Stacked control panels
- Smaller visualization (200px height)
- Simplified controls (fewer visible parameters)
- Touch-optimized control sizes (min 44x44px)

**Tablet (768px - 1024px):**
- Two-column layout for controls
- Medium visualization (300px height)
- All parameters visible

**Desktop (> 1024px):**
- Three-column layout
- Large visualization (400px+ height)
- Side-by-side synth type comparison mode
- Keyboard shortcuts overlay

---

## Accessibility

### Color Contrast
- Text contrast ratio: 4.5:1 minimum (WCAG AA)
- Interactive elements: 3:1 minimum
- Test with tools like WebAIM Contrast Checker

### Keyboard Navigation
- All controls keyboard accessible
- Tab order follows logical flow
- Focus indicators clearly visible (coral pink ring)
- Keyboard shortcuts for common actions:
  - Space: Play/pause
  - Arrow keys: Adjust focused control
  - Numbers 1-4: Switch waveforms
  - Escape: Close modals

### Screen Reader Support
```tsx
// Example: Knob with ARIA
<div
  role="slider"
  aria-label="Filter cutoff frequency"
  aria-valuemin={20}
  aria-valuemax={20000}
  aria-valuenow={cutoff}
  aria-valuetext={`${cutoff} hertz`}
  tabIndex={0}
  onKeyDown={handleKeyboardAdjust}
>
  {/* Knob visual */}
</div>
```

### Motion Preferences
Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icon System

### Control Icons
- Use Lucide React or Heroicons
- 24px standard size
- Stroke width: 2px
- Rounded corners

### Custom Synth Icons
- Waveform shapes (sine, square, saw, triangle)
- Filter types (low-pass, high-pass, band-pass)
- Modulation indicators (LFO, envelope)

### Animated Icons
- Loading: Pulsing waveform
- Playing: Animated speaker cone
- Recording: Pulsing red dot

---

## Example Component: Complete Knob

```tsx
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function Knob({ label, value, min, max, onChange, unit = '' }: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 270 - 135; // -135° to +135°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Start drag logic...
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Knob */}
      <motion.div
        ref={knobRef}
        className="relative w-20 h-20 cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onMouseDown={handleMouseDown}
      >
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full blur-lg transition-opacity
          ${isDragging ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'}
        `} style={{ backgroundColor: 'var(--coral-pink)' }} />

        {/* Track SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="35"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="35"
            fill="none"
            stroke="url(#knobGradient)"
            strokeWidth="4"
            strokeDasharray={`${percentage * 2.2} 220`}
            strokeDashoffset="-55"
            transform="rotate(-135 40 40)"
            className="transition-all duration-200"
          />
          <defs>
            <linearGradient id="knobGradient">
              <stop offset="0%" stopColor="var(--coral-pink)" />
              <stop offset="100%" stopColor="var(--soft-purple)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center dial */}
        <div className="absolute inset-2 rounded-full bg-white shadow-md flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900">
            {value}{unit}
          </span>
        </div>

        {/* Indicator */}
        <div
          className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-coral-pink to-transparent origin-bottom transition-transform"
          style={{
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transformOrigin: 'bottom center'
          }}
        />
      </motion.div>

      {/* Value display */}
      <span className="text-xs text-gray-500">
        {min} - {max}{unit}
      </span>
    </div>
  );
}
```

---

## Design Tokens (Tailwind Config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        coral: {
          pink: '#FF6B9D',
          light: '#FFB3D1',
          dark: '#E5548B',
        },
        purple: {
          soft: '#C687F0',
          lavender: '#E5D4FF',
          deep: '#9B5EC8',
        },
        sunshine: {
          DEFAULT: '#FFD93D',
          light: '#FFF4C4',
        },
      },
      fontFamily: {
        display: ['Nunito', 'Quicksand', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-coral': '0 0 24px rgba(255, 107, 157, 0.4)',
        'glow-purple': '0 0 24px rgba(198, 135, 240, 0.4)',
        'glow-yellow': '0 0 24px rgba(255, 217, 61, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
```

---

This design system provides a comprehensive foundation for building Synthualizer with a consistent, delightful "super cute" aesthetic that makes learning synthesis fun and approachable.
