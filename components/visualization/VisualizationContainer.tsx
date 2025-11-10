'use client';

import { WaveformView } from './WaveformView';

interface VisualizationContainerProps {
  analyser: AnalyserNode | null;
}

/**
 * Container for audio visualizations
 * Provides styled wrapper and will support multiple visualization modes in future
 */
export function VisualizationContainer({ analyser }: VisualizationContainerProps) {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-coral-pink/5 to-purple-soft/5 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
      {/* Visualization mode selector - placeholder for Phase 2 */}
      <div className="absolute top-4 right-4 z-10 opacity-50">
        <div className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-lg border border-gray-200 text-xs font-medium text-gray-600">
          Waveform
        </div>
      </div>

      {/* Canvas visualization */}
      <WaveformView analyser={analyser} />

      {/* Info overlay - shows when no audio is playing */}
      {!analyser && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6 py-4 bg-white/80 backdrop-blur rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-600">
              Press a key to start playing
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Watch the waveform change as you adjust parameters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
