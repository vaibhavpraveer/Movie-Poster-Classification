import React, { useState } from 'react';
import type { GenrePrediction } from '../types';
import { BarChart3, Award } from 'lucide-react';

interface GenreProbabilityChartProps {
  allPredictions: GenrePrediction[];
  predictedGenres: GenrePrediction[];
  threshold: number;
}

export const GenreProbabilityChart: React.FC<GenreProbabilityChartProps> = ({
  allPredictions,
  predictedGenres,
  threshold,
}) => {
  const [viewMode, setViewMode] = useState<'top' | 'all'>('top');

  const displayedList = viewMode === 'top' ? allPredictions.slice(0, 7) : allPredictions;

  // Helper to colorize bars according to confidence tier
  const getBarColor = (confidence: number, index: number) => {
    if (index === 0) return 'from-purple-500 via-pink-500 to-rose-500';
    if (confidence >= threshold) return 'from-purple-500 to-indigo-500';
    if (confidence >= 0.2) return 'from-indigo-600 to-blue-500';
    return 'from-gray-700 to-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-heading">
            Neural Probability Distribution
          </h4>
        </div>

        <div className="flex items-center space-x-1 p-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
          <button
            onClick={() => setViewMode('top')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'top'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top 7
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'all'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All 19
          </button>
        </div>
      </div>

      {/* Threshold indicator line info */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
        <span>Decision Threshold: {(threshold * 100).toFixed(0)}%</span>
        <span>{predictedGenres.length} Genre{predictedGenres.length === 1 ? '' : 's'} Selected</span>
      </div>

      {/* Probability Bars List */}
      <div className="space-y-2.5">
        {displayedList.map((item, index) => {
          const isAboveThreshold = item.confidence >= threshold;
          const isTop = index === 0;

          return (
            <div
              key={item.genre}
              className={`p-2.5 rounded-xl border transition-all ${
                isTop
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : isAboveThreshold
                  ? 'bg-white/[0.02] border-white/10 hover:border-purple-500/20'
                  : 'bg-black/20 border-white/[0.04] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center space-x-2">
                  {isTop ? (
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <span className="w-4 text-center font-mono text-[10px] text-gray-500">
                      {index + 1}
                    </span>
                  )}
                  <span className={`font-medium ${isTop ? 'text-white font-bold' : 'text-gray-300'}`}>
                    {item.genre}
                  </span>
                  {isAboveThreshold && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      PREDICTED
                    </span>
                  )}
                </div>

                <span className={`font-mono font-semibold ${isTop ? 'text-purple-300' : 'text-gray-400'}`}>
                  {item.percentage}
                </span>
              </div>

              {/* Progress bar container */}
              <div className="relative w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                {/* Decision threshold marker vertical tick */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-400/60 z-10"
                  style={{ left: `${Math.min(threshold * 100, 100)}%` }}
                  title={`Threshold ${(threshold * 100).toFixed(0)}%`}
                />

                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getBarColor(
                    item.confidence,
                    index
                  )} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(item.confidence * 100, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
