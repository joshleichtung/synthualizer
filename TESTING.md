# Phase 1 MVP Testing Checklist

## Automated Verification

✅ **Server Status**: Development server running on http://localhost:3001
✅ **Page Load**: HTML renders correctly with all components
✅ **Component Structure**: All sections present in DOM

## Manual Testing Checklist

### 1. Visual Inspection
- [ ] Open http://localhost:3001 in browser
- [ ] Verify "Synthualizer" header displays correctly
- [ ] Check gradient background on visualization container
- [ ] Confirm all UI sections are visible:
  - Visualization canvas (empty initially)
  - Oscillator controls
  - Filter controls
  - Keyboard

### 2. Waveform Selection
- [ ] Click "Sine" button → Should highlight in coral pink
- [ ] Click "Square" button → Should switch highlight
- [ ] Click "Saw" button → Should switch highlight
- [ ] Click "Triangle" button → Should switch highlight
- [ ] Verify smooth transition animation on selection

### 3. Keyboard Interaction
- [ ] Click and hold "C" key
  - [ ] Visual feedback: button changes to coral pink with glow
  - [ ] Audio: Hear a tone at 261.63 Hz
  - [ ] Visualization: Waveform appears in canvas
- [ ] Release "C" key
  - [ ] Audio fades out smoothly
  - [ ] Button returns to default state
- [ ] Try all keys (C, D, E, F, G, A, B, C)
  - [ ] Each should play a different pitch
  - [ ] Frequencies should be audible

### 4. Filter Controls
While playing a note:
- [ ] Drag "Cutoff" slider left (low values ~100Hz)
  - [ ] Sound becomes muffled/darker
  - [ ] Waveform shape changes in visualization
  - [ ] Value display updates
- [ ] Drag "Cutoff" slider right (high values ~10000Hz)
  - [ ] Sound becomes brighter
  - [ ] More harmonics visible in waveform
- [ ] Adjust "Resonance" slider
  - [ ] At low values (~0.5): subtle effect
  - [ ] At high values (~15): pronounced resonance peak
  - [ ] Can hear "ringing" at cutoff frequency

### 5. Real-time Visualization
- [ ] Play a note and observe canvas
  - [ ] Waveform animates at ~60fps
  - [ ] Smooth rendering without flickering
  - [ ] Coral pink waveform color
- [ ] Change waveform type while playing
  - [ ] Sine: smooth wave
  - [ ] Square: rectangular wave
  - [ ] Saw: sawtooth wave
  - [ ] Triangle: triangular wave
- [ ] Adjust cutoff while playing
  - [ ] Waveform changes reflect filter effect

### 6. Responsive Design
- [ ] Resize browser window
  - [ ] Layout adapts on smaller screens (single column)
  - [ ] Canvas scales correctly
  - [ ] Controls remain functional
- [ ] Test on mobile (if available)
  - [ ] Touch interactions work on keyboard
  - [ ] Sliders are touch-friendly

### 7. Browser Compatibility
Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Note any differences in audio or rendering

### 8. Performance
- [ ] Play multiple notes rapidly
  - [ ] No audio glitches or clicks
  - [ ] Smooth transitions
- [ ] Adjust sliders quickly
  - [ ] Parameters update smoothly
  - [ ] No lag or stuttering
- [ ] Open browser DevTools Console
  - [ ] No errors in console
  - [ ] No warnings (except expected ones)

### 9. Edge Cases
- [ ] Click multiple keyboard keys rapidly
  - [ ] Only one note plays at a time (monophonic)
  - [ ] No overlapping audio artifacts
- [ ] Move slider to extreme values
  - [ ] Cutoff at 20Hz: very muffled
  - [ ] Cutoff at 20000Hz: full brightness
  - [ ] Resonance at 20: may self-oscillate (expected)
- [ ] Refresh page
  - [ ] State resets to defaults
  - [ ] Audio context initializes properly

## Expected Results Summary

### ✅ Working Features
1. Subtractive synth engine with Web Audio API
2. Multiple waveform types (sine, square, sawtooth, triangle)
3. Low-pass filter with cutoff and resonance controls
4. Attack/release envelope for smooth note transitions
5. Real-time waveform visualization
6. Interactive musical keyboard (C4-C5 octave)
7. Responsive layout
8. Smooth parameter updates

### Known Limitations (Phase 1)
- Monophonic (single note at a time)
- No ADSR envelope controls (just attack/release)
- No LFO modulation
- Single visualization mode (waveform only)
- No preset system
- No effects (reverb, delay, etc.)

## Console Output

Expected console messages (if any):
```
[None expected - clean console]
```

Unexpected errors should be investigated.

## Performance Metrics

- **Visualization FPS**: ~60fps (use Chrome DevTools Performance tab)
- **Audio Latency**: < 50ms (depends on system)
- **Initial Load Time**: < 2s
- **Bundle Size**: Check with `npm run build`

## Next Steps After Testing

If all tests pass:
- [ ] Commit test results
- [ ] Tag Phase 1 complete
- [ ] Begin Phase 2 planning
- [ ] Update README progress tracker

If issues found:
- [ ] Document issues in GitHub Issues
- [ ] Fix critical bugs
- [ ] Re-test affected areas
