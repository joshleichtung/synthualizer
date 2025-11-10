'use client';

import { WaveformView } from './WaveformView';

interface VisualizationContainerProps {
  analyser: AnalyserNode | null;
}

/**
 * Container for audio visualizations
 * Styled as a mouth for the cartoon character
 */
export function VisualizationContainer({ analyser }: VisualizationContainerProps) {
  return (
    <div className="relative w-full h-64 md:h-80 bg-gray-900 rounded-[80px] overflow-hidden border-8 border-gray-800 shadow-2xl">
      {/* Inner mouth/lip effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-pink-300/20 to-pink-400/20" />

      {/* Canvas visualization */}
      <div className="relative z-10 w-full h-full">
        <WaveformView analyser={analyser} />
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
