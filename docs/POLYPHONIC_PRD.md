# Product Requirements Document: Polyphonic Keyboard Mode

**Product:** Synthualizer - Character-based Visual Synthesizer
**Feature:** Polyphonic Voice Architecture + QWERTY Keyboard Input
**Owner:** Josh
**Status:** Planning
**Target:** Phase 1.11
**Priority:** P0 (High - Blocks full ADSR showcase)

---

## Problem Statement

### Current State
Users interact with Synthualizer through an on-screen toggle keyboard. Clicking a note starts it (attack), and it sustains indefinitely until clicked again (release). This creates a "drone" experience.

### Core Issues
1. **ADSR controls are underutilized:** Full envelope cycle (Attack → Decay → Sustain → Release) never occurs naturally. Users must manually toggle to hear release phase.

2. **Limited musical expression:** Cannot play melodies with proper articulation or build chords.

3. **Keyboard input missing:** Desktop users expect QWERTY keyboard support for faster, more intuitive playing.

4. **Shift sustain would be pointless:** Without polyphony, Shift-to-sustain only holds one note - not musically useful.

### User Pain Points
- "The ADSR controls don't feel useful when the synth just drones."
- "I want to play chords and hear how the envelope shapes them."
- "Why can't I use my computer keyboard to play?"
- "The synth feels more like a demo than an instrument."

---

## Goals & Non-Goals

### Goals
✅ **Enable proper ADSR articulation:** Users should hear the full envelope cycle naturally by pressing/releasing keys.

✅ **Support chord playing:** Users can press multiple keys simultaneously to create chords (up to 6 notes).

✅ **Add QWERTY keyboard input:** Desktop users can play using computer keyboard with standard musical layout.

✅ **Implement Shift sustain:** Holding Shift latches notes, enabling chord building and sustained passages.

✅ **Visualize polyphony:** Show active voice count through character animation (e.g., eyebrow intensity).

✅ **Maintain current simplicity:** Keep UI clean, don't overwhelm with complexity.

### Non-Goals
❌ **Unlimited polyphony:** Voice limit (6) is intentional design constraint.

❌ **MIDI input:** Out of scope for this phase (future enhancement).

❌ **Portamento/glide:** Monophonic feature, deferred to future.

❌ **Per-voice parameter control:** All voices share same ADSR/filter settings (paraphonic-style simplicity).

❌ **Mobile keyboard input:** Focus on desktop experience first.

---

## User Stories

### Primary User: Desktop Music Enthusiast
**Persona:** Alex, 25, hobbyist musician, creates beats and experiments with web tools.

**Story 1: Playing Melodies**
> "As a user, I want to play melodies using my QWERTY keyboard so that I can explore the synth more musically without reaching for my mouse."

**Acceptance Criteria:**
- Pressing a QWERTY key (e.g., 'A') triggers a note with attack phase
- Holding the key sustains the note at sustain level
- Releasing the key triggers the release phase
- Different keys play different pitches based on standard musical layout
- Octave selector still works to shift keyboard range

**Story 2: Building Chords**
> "As a user, I want to play chords by pressing multiple keys so that I can explore harmonic relationships and hear how the filter/ADSR shapes complex sounds."

**Acceptance Criteria:**
- Can press up to 6 keys simultaneously
- Each note has independent envelope (proper polyphonic behavior)
- Waveform visualization shows mixed output
- Visual indicator shows how many voices are active (e.g., eyebrow animation)

**Story 3: Sustain Pedal Behavior**
> "As a user, I want to hold Shift to sustain notes so that I can build up chords gradually or create sustained pads while playing melody on top."

**Acceptance Criteria:**
- Holding Shift before releasing a key keeps that note sustained
- Can build up multiple sustained notes while Shift is held
- Releasing Shift releases all sustained notes simultaneously
- Visual feedback shows which notes are sustained

**Story 4: Understanding Voice Limits**
> "As a user, I want to understand when I've reached the voice limit so that I know why older notes are cutting off."

**Acceptance Criteria:**
- When 7th note is pressed, oldest note is "stolen" (released gracefully)
- Voice count indicator shows "6/6 voices" or similar
- Voice stealing is inaudible (no clicks/pops)
- Feels intentional, not like a bug

### Secondary User: Synthesis Learner
**Persona:** Jordan, 19, learning synthesis, uses web tools to visualize concepts.

**Story 5: Visualizing Envelopes**
> "As a learner, I want to see and hear how ADSR envelopes shape sound in real-time so that I understand amplitude envelope concepts."

**Acceptance Criteria:**
- ADSR display updates in real-time
- Playing notes demonstrates full attack → decay → sustain → release cycle
- Adjusting ADSR controls while playing notes shows immediate effect
- Documentation explains how polyphony affects overall sound

---

## Solution Overview

### Architecture: 6-Voice Polyphonic Synthesis
- Pre-allocate pool of 6 independent voices
- Each voice has own oscillator(s) and gain node (envelope)
- Voice allocation on note-on, voice stealing when pool full
- Per-voice ADSR envelopes (true polyphony)

### QWERTY Keyboard Layout
```
Black keys: Q W E  R T Y U  I O P [
White keys: A S D F G H J K L ; '
White keys: Z X C V B N M , . /
```
- 2-octave span
- Standard musical keyboard layout (familiar to pianists)
- Works with existing octave selector

### Shift Sustain Behavior
- **Shift pressed:** Notes latch on release (sustain pedal)
- **Shift released:** All sustained notes release together
- Enables chord building and sustained passages

### Visual Feedback
- **Eyebrows:** Angle/intensity increases with active voice count
- **On-screen keyboard:** Highlights keys when QWERTY pressed
- **Voice count badge:** Shows "4/6 voices" (optional)

---

## User Experience

### Happy Path: Playing a Melody
1. User loads Synthualizer
2. Presses 'A' key → Note C4 starts with attack phase
3. Holds 'A' → Note sustains at sustain level
4. Releases 'A' → Note enters release phase, fades out
5. Presses 'S' → Note D4 starts with attack phase
6. **Result:** Smooth melodic articulation, ADSR feels responsive

### Happy Path: Building a Chord
1. User holds Shift key
2. Presses 'A' (C), 'D' (E), 'G' (G) → C major triad plays
3. Keys are released but Shift is still held → Chord sustains
4. Releases Shift → All notes release together
5. **Result:** Chord builds naturally, sustains indefinitely, releases cleanly

### Edge Case: Voice Stealing
1. User plays 6-note chord (all voices allocated)
2. Presses 7th key → Oldest note (voice 0) is stolen
3. Voice 0's release envelope triggers briefly
4. New note starts on voice 0
5. **Result:** Imperceptible transition, sounds natural

### Edge Case: Rapid Re-triggering
1. User plays note 'A', holds it
2. While 'A' is sustained, presses 'A' again (e.g., key repeat or deliberate)
3. Same voice re-triggers: Current envelope canceled, new attack starts
4. **Result:** Note re-articulates cleanly (common in synth playing)

---

## UI/UX Changes

### New: Voice Count Indicator (Optional)
- **Location:** Top-right corner or near character's head
- **Display:** "4/6 voices" or 6 dots with 4 filled
- **Behavior:** Updates in real-time as notes play/release

### Enhanced: On-Screen Keyboard
- **Current:** Click to toggle notes
- **New:** Also shows visual feedback when QWERTY key pressed
  - Border color changes
  - Glow effect
  - Label shows QWERTY key mapping (e.g., "C - A")

### Enhanced: Character Eyebrows
- **Current:** Static or subtle animation
- **New:** Angle and thickness mapped to active voice count
  - 0 voices: Relaxed (0°)
  - 3 voices: Slightly raised (15°)
  - 6 voices: Intense/surprised (30°)

### New: Keyboard Instructions
- **Location:** Below on-screen keyboard
- **Content:**
  - "Play with QWERTY keyboard"
  - "Hold Shift to sustain notes"
  - "Press Z-/ for lower octave, A-' for upper octave"

---

## Technical Requirements

### Performance
- **Latency:** <50ms from keypress to audio start (perceived as instant)
- **CPU Usage:** <10% on modern hardware (2020+ laptop)
- **Voice Stealing:** Inaudible (no clicks, pops, or abrupt cutoffs)
- **Browser Support:** Chrome 90+, Firefox 88+, Safari 14+

### Audio Quality
- **Sample Rate:** 48kHz (browser default)
- **Bit Depth:** 32-bit float (Web Audio standard)
- **No Clipping:** Proper gain staging (6 voices × 0.5 max gain = 3.0 → divide by 3 = 1.0)

### Code Quality
- **Type Safety:** Full TypeScript, no `any` types
- **Testing:** Unit tests for voice allocation, keyboard mapping
- **Documentation:** Inline comments for complex audio logic
- **Performance:** No memory leaks, proper oscillator cleanup

---

## Success Metrics

### Quantitative
- [ ] **Latency:** Keyboard-to-audio latency <50ms (measured with audio analysis)
- [ ] **CPU:** <10% CPU usage with 6 voices active (Chrome DevTools profiler)
- [ ] **Memory:** No memory growth after 5 minutes of playing (stable at ~50MB)
- [ ] **Voice Stealing:** 0 audible clicks when stealing voices (manual listening test)

### Qualitative
- [ ] **User Feedback:** "ADSR controls now feel essential"
- [ ] **User Feedback:** "Keyboard input makes this feel like a real instrument"
- [ ] **User Feedback:** "Voice limit doesn't feel restrictive"
- [ ] **Internal Review:** Passes heuristic evaluation (easy to learn, responsive, satisfying)

### Adoption
- [ ] **Engagement:** Average session time increases by 2x (drone mode: 2 min → polyphonic: 4 min)
- [ ] **Feature Usage:** 80% of desktop users use QWERTY keyboard (vs 20% mouse-only)
- [ ] **Retention:** 60% of users return to explore chords/melodies (vs 30% in drone mode)

---

## Risks & Mitigations

### Risk: Browser Audio Latency
**Impact:** High - Latency >100ms makes keyboard playing frustrating
**Likelihood:** Medium - Varies by browser/OS
**Mitigation:**
- Use small buffer sizes (128-256 samples)
- Test across browsers/OS combinations
- Document known limitations (e.g., "Best in Chrome on desktop")

### Risk: Voice Stealing Audibility
**Impact:** High - Clicks/pops ruin musical experience
**Likelihood:** Medium - Tricky to implement correctly
**Mitigation:**
- Implement "polite stealing" (trigger release before re-allocating)
- Add 100ms grace period for cleanup
- Extensive manual testing with various musical phrases

### Risk: Keyboard Event Conflicts
**Impact:** Medium - Browser shortcuts interfere with music keys
**Likelihood:** High - Many keys have default actions
**Mitigation:**
- `e.preventDefault()` on music keys
- Only prevent when synth is focused/active
- Document known conflicts (e.g., Cmd+Q on Mac)

### Risk: Increased Complexity
**Impact:** Medium - More complex codebase, harder to maintain
**Likelihood:** High - Polyphony is inherently complex
**Mitigation:**
- Comprehensive inline documentation
- Unit tests for voice allocation logic
- Technical spec document (already created)
- Modular architecture (voice pool pattern)

---

## Dependencies

### Technical
- ✅ Web Audio API (already in use)
- ✅ Zustand state management (already in use)
- ✅ Framer Motion animations (already in use)
- ✅ ADSR implementation (already completed)

### Team
- **Development:** 1 engineer (Josh + Claude)
- **Testing:** Josh (manual testing)
- **Design:** N/A (reuses existing character design)

### External
- None (fully self-contained feature)

---

## Timeline

### Phase 1: Engine Refactoring (2-3 days)
- [ ] Create Voice interface
- [ ] Refactor SubtractiveEngine for voice pool
- [ ] Implement noteOn/noteOff methods
- [ ] Test with existing on-screen keyboard (click to play)
- **Milestone:** Polyphony works with mouse clicks

### Phase 2: QWERTY Input (1-2 days)
- [ ] Create KeyboardInput component
- [ ] Implement key mapping (QWERTY → frequencies)
- [ ] Add event handlers (keydown, keyup, Shift)
- [ ] Integrate with store (noteOn/noteOff actions)
- **Milestone:** Can play with QWERTY keyboard

### Phase 3: Visual Feedback (1 day)
- [ ] Add eyebrow animation (voice count → angle)
- [ ] Highlight on-screen keys when QWERTY pressed
- [ ] Add keyboard instructions text
- [ ] Optional: Voice count badge
- **Milestone:** Visual feedback is responsive and clear

### Phase 4: FM Engine (1 day)
- [ ] Apply voice pool pattern to FMEngine
- [ ] Test FM polyphony
- [ ] Ensure feature parity with SubtractiveEngine
- **Milestone:** Both engines support polyphony

### Phase 5: Testing & Polish (1 day)
- [ ] Manual testing (melodies, chords, voice stealing)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance profiling (CPU, memory)
- [ ] Bug fixes and refinements
- **Milestone:** Ready for release

**Total Estimated Time:** 6-8 days (flexible based on complexity)

---

## Launch Plan

### Soft Launch
- Deploy to staging environment
- Internal testing with Josh
- Gather feedback, iterate

### Public Launch
- Deploy to production
- Update README with new feature
- Optional: Social media post demonstrating polyphony
- Monitor for bug reports

### Post-Launch
- Monitor performance metrics (CPU, latency)
- Gather user feedback via GitHub issues
- Plan future enhancements (LFO, portamento, MIDI)

---

## Future Enhancements (Out of Scope)

### Phase 1.12: LFO Modulation
- Add LFO with rate, depth, routing controls
- Visualize with uvula vibration (user's suggestion)
- Route to pitch, filter, amplitude

### Phase 1.13: Portamento/Glide
- Smooth pitch transitions between notes
- Toggle monophonic mode (disables polyphony, enables portamento)
- Classic "lead synth" mode

### Phase 1.14: MIDI Input
- Web MIDI API integration
- Use hardware MIDI keyboard
- Map velocity to ADSR peak

### Phase 1.15: Arpeggiator
- Pattern-based note sequencing
- Up, down, up-down, random patterns
- Tempo control

### Phase 2.x: Effects Rack
- Reverb, delay, distortion
- Per-voice or master effects
- Visual representation in character design

---

## Open Questions

1. **Should filter be per-voice or master?**
   - **Current thinking:** Master (simpler, "paraphonic-style")
   - **Trade-off:** Per-voice is richer but more CPU intensive

2. **Voice count display: Badge or eyebrows only?**
   - **Current thinking:** Eyebrows primary, optional badge
   - **Trade-off:** Badge is clearer but adds UI clutter

3. **Should mobile touch keyboard support multiple simultaneous touches?**
   - **Current thinking:** Defer to future (focus on desktop first)
   - **Trade-off:** Mobile users might expect polyphony too

4. **Voice stealing algorithm: Oldest or quietest?**
   - **Current thinking:** Oldest (simpler, more predictable)
   - **Trade-off:** Quietest is more sophisticated but complex

---

## Appendix

### Related Documents
- [Technical Specification: 6-Voice Polyphonic Architecture](./POLYPHONIC_TECHNICAL_SPEC.md)
- [Original Design Doc: Phase 1.10](./PHASE_1_10_DESIGN.md) (ADSR feature)

### Research References
- [Web Audio Best Practices](https://developer.chrome.com/blog/audio-performance/)
- [Voice Allocation Algorithms](https://www.native-instruments.com/forum/threads/voice-allocation.339850/)
- [Polyphonic Web Audio](https://webaudioapi.com/samples/poly-synth/)

### Competitive Analysis
- **Tone.js PolySynth:** Unlimited voices, no visual feedback
- **WebAudioFont:** MIDI-based, not keyboard-driven
- **Syntorial Web:** Monophonic only
- **Serum Web:** Polyphonic, complex UI (not beginner-friendly)

**Differentiation:** Character-based visualization, educational focus, intentional 6-voice limit as creative constraint.

---

**Status:** Approved for implementation
**Next Steps:** Begin Phase 1 (Engine Refactoring)
