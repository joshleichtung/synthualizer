'use client';

import { WaveformView } from './WaveformView';

interface VisualizationContainerProps {
  analyser: AnalyserNode | null;
  filterNode: BiquadFilterNode | null;
  cutoff: number;
  resonance: number;
  waveform: OscillatorType;
}

/**
 * Container for audio visualizations
 * Styled as a mouth for the cartoon character
 * Shape changes based on waveform type to express character personality
 */
export function VisualizationContainer({ analyser, filterNode, cutoff, resonance, waveform }: VisualizationContainerProps) {
  // Map waveform types to mouth shapes
  const mouthShapeClass = {
    sine: 'rounded-[80px]',     // Smooth, circular - calm and relaxed
    square: 'rounded-[24px]',   // Sharp corners - alert and precise
    sawtooth: 'rounded-tl-[80px] rounded-tr-[24px] rounded-br-[24px] rounded-bl-[80px]', // Asymmetric - dynamic
    triangle: 'rounded-t-[80px] rounded-b-[24px]', // Pointed bottom - balanced
  }[waveform];

  return (
    <div className={`relative w-full h-56 md:h-64 lg:h-80 bg-gray-900 overflow-hidden border-4 md:border-6 lg:border-8 border-gray-800 shadow-2xl transition-all duration-700 ease-in-out ${mouthShapeClass}`}>
      {/* Inner mouth/lip effect */}
      <div className={`absolute inset-0 bg-gradient-to-b from-pink-300/20 to-pink-400/20 transition-all duration-700 ease-in-out ${mouthShapeClass}`} />

      {/* Canvas visualization */}
      <div className={`relative z-10 w-full h-full overflow-hidden transition-all duration-700 ease-in-out ${mouthShapeClass}`}>
        <WaveformView
          analyser={analyser}
          filterNode={filterNode}
          cutoff={cutoff}
          resonance={resonance}
        />
      </div>

      {/* Info overlay - shows when no audio is playing */}
      {!analyser && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-6 py-4 bg-gray-800/80 backdrop-blur rounded-3xl border-4 border-gray-700">
            <p className="text-lg font-bold text-white">
              🎵 Click a note to make me sing!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
