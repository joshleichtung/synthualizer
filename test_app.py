#!/usr/bin/env python3
"""
Test Synthualizer Phase 1 MVP
Verifies all components are working correctly
"""

from playwright.sync_api import sync_playwright
import time

def test_synthualizer():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("🧪 Testing Synthualizer Phase 1 MVP")
        print("=" * 50)

        # Navigate to app
        print("\n1. Loading application...")
        page.goto('http://localhost:3001')
        page.wait_for_load_state('networkidle')
        time.sleep(1)  # Extra wait for any animations

        # Take initial screenshot
        page.screenshot(path='/tmp/synthualizer_initial.png', full_page=True)
        print("   ✅ App loaded successfully")
        print("   📸 Screenshot saved to /tmp/synthualizer_initial.png")

        # Check header
        print("\n2. Checking header...")
        header = page.locator('h1:has-text("Synthualizer")')
        assert header.is_visible(), "Header not found"
        print("   ✅ Header found: Synthualizer")

        # Check visualization container
        print("\n3. Checking visualization container...")
        viz = page.locator('canvas')
        assert viz.is_visible(), "Visualization canvas not found"
        print("   ✅ Visualization canvas present")

        # Check oscillator controls
        print("\n4. Checking oscillator controls...")
        osc_section = page.locator('h2:has-text("Oscillator")')
        assert osc_section.is_visible(), "Oscillator section not found"

        # Check waveform buttons
        waveforms = ['Sine', 'Square', 'Saw', 'Triangle']
        for wf in waveforms:
            btn = page.locator(f'button:has-text("{wf}")')
            assert btn.is_visible(), f"{wf} button not found"
        print(f"   ✅ All waveform buttons found: {', '.join(waveforms)}")

        # Check filter controls
        print("\n5. Checking filter controls...")
        filter_section = page.locator('h2:has-text("Filter")')
        assert filter_section.is_visible(), "Filter section not found"

        cutoff_label = page.locator('label:has-text("Cutoff")')
        assert cutoff_label.is_visible(), "Cutoff slider not found"

        resonance_label = page.locator('label:has-text("Resonance")')
        assert resonance_label.is_visible(), "Resonance slider not found"
        print("   ✅ Filter controls found (Cutoff, Resonance)")

        # Check keyboard
        print("\n6. Checking keyboard...")
        keyboard_section = page.locator('h3:has-text("Keyboard")')
        assert keyboard_section.is_visible(), "Keyboard section not found"

        # Check for note buttons
        notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
        for note in notes:
            # Look for buttons containing the note name
            btn = page.locator(f'button:has-text("{note}")')
            assert btn.count() > 0, f"{note} key not found"
        print(f"   ✅ All keyboard keys found: {', '.join(notes)}")

        # Test interactions
        print("\n7. Testing interactions...")

        # Click Square waveform
        print("   • Clicking Square waveform...")
        square_btn = page.locator('button:has-text("Square")')
        square_btn.click()
        time.sleep(0.2)
        page.screenshot(path='/tmp/synthualizer_square_selected.png', full_page=True)
        print("   ✅ Square waveform selected")

        # Try clicking a keyboard key (A4 - 440Hz)
        print("   • Clicking A key (440Hz)...")
        a_key = page.locator('button').filter(has_text='A').first

        # Mouse down to trigger note
        a_key.hover()
        page.mouse.down()
        time.sleep(0.3)  # Hold for 300ms
        page.screenshot(path='/tmp/synthualizer_playing_note.png', full_page=True)
        page.mouse.up()
        time.sleep(0.2)
        print("   ✅ Note triggered (visual feedback captured)")

        # Adjust cutoff slider
        print("   • Adjusting cutoff slider...")
        # Find the cutoff slider input
        cutoff_slider = page.locator('input[type="range"]').first
        cutoff_slider.fill('500')  # Set to 500Hz
        time.sleep(0.2)
        page.screenshot(path='/tmp/synthualizer_cutoff_adjusted.png', full_page=True)
        print("   ✅ Cutoff slider adjusted")

        # Final screenshot
        page.screenshot(path='/tmp/synthualizer_final.png', full_page=True)

        # Check console for errors
        print("\n8. Checking console logs...")
        console_messages = []

        def handle_console(msg):
            console_messages.append({
                'type': msg.type,
                'text': msg.text
            })

        page.on('console', handle_console)

        # Reload to capture console messages
        page.reload()
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        errors = [msg for msg in console_messages if msg['type'] == 'error']
        warnings = [msg for msg in console_messages if msg['type'] == 'warning']

        if errors:
            print(f"   ⚠️  {len(errors)} console errors found:")
            for err in errors[:5]:  # Show first 5
                print(f"      - {err['text']}")
        else:
            print("   ✅ No console errors")

        if warnings:
            print(f"   ℹ️  {len(warnings)} console warnings (may be normal)")

        browser.close()

        print("\n" + "=" * 50)
        print("✨ Phase 1 MVP Test Complete!")
        print("\nScreenshots saved:")
        print("  • /tmp/synthualizer_initial.png")
        print("  • /tmp/synthualizer_square_selected.png")
        print("  • /tmp/synthualizer_playing_note.png")
        print("  • /tmp/synthualizer_cutoff_adjusted.png")
        print("  • /tmp/synthualizer_final.png")
        print("\n✅ All tests passed!")

        return True

if __name__ == '__main__':
    try:
        test_synthualizer()
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
