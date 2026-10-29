import React from 'react';
import { Sparkles, Download, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import type { PredictionResponse } from '../types';
import { GenreProbabilityChart } from './GenreProbabilityChart';

interface PredictionResultsProps {
  prediction: PredictionResponse;
  imageUrl: string;
  imageName?: string;
  onReset: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  prediction,
  imageUrl,
  imageName,
  onReset,
}) => {
  const { top_genre, predicted_genres, all_predictions, used_fallback, threshold_used, inference_time_ms } =
    prediction;

  const handleDownloadReport = () => {
    const reportData = {
      project: "FRAME//AI",
      timestamp: new Date().toISOString(),
      poster_file: imageName || "uploaded_poster.jpg",
      inference_time_ms,
      threshold_used,
      top_genre,
      predicted_genres,
      all_rankings: all_predictions,
      used_fallback,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frame_ai_intel_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Theatrical Poster Preview with Hologram Frame */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-[2/3] rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] group">
            <img
              src={imageUrl}
              alt="Analyzed movie poster"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Corner Bracket Accents (Sci-Fi viewfinder) */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-purple-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-400 pointer-events-none" />

            {/* HUD Status Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SCAN COMPLETE</span>
              </div>

              <div className="px-2 py-0.5 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-mono text-purple-300">
                224×224 RGB
              </div>
            </div>

            {/* Bottom HUD Badge */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div className="truncate mr-2">
                <div className="text-[10px] font-mono uppercase text-gray-400">Target Canvas</div>
                <div className="text-xs font-semibold text-white truncate">
                  {imageName || "Custom Poster Upload"}
                </div>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>{inference_time_ms}ms</span>
              </div>
            </div>
          </div>

          {/* Action Row Under Poster */}
          <div className="flex items-center space-x-3 mt-4 w-full max-w-sm">
            <button
              onClick={onReset}
              className="flex-1 py-2.5 px-4 rounded-xl glass-panel-interactive border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center justify-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Analyze Another</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              title="Download Prediction Intelligence JSON"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Right Column: Prediction Intelligence & Probabilities */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Predicted Genre Hero Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-900/30 via-[#0D1018] to-indigo-950/20 border border-purple-500/30 shadow-xl overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Primary Predicted Genre</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                  {top_genre?.genre || "Uncertain"}
                </h3>
              </div>

              {/* Confidence Callout */}
              <div className="sm:text-right">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  {top_genre?.percentage || "0.0%"}
                </div>
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mt-0.5">
                  Confidence Score
                </div>
              </div>
            </div>

            {/* Fallback Notice if triggered */}
            {used_fallback && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  No genre crossed the decision threshold of {(threshold_used * 100).toFixed(0)}%. Showing top candidate fallback.
                </span>
              </div>
            )}

            {/* Secondary Tags */}
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2.5">
                All Predicted Genre Labels ({predicted_genres.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {predicted_genres.map((g) => (
                  <span
                    key={g.genre}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white"
                  >
                    <span className="font-medium">{g.genre}</span>
                    <span className="text-purple-400 font-mono text-[11px] font-semibold">
                      {g.percentage}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Probability Distribution Chart */}
          <div className="p-6 rounded-2xl glass-panel border border-white/[0.08]">
            <GenreProbabilityChart
              allPredictions={all_predictions}
              predictedGenres={predicted_genres}
              threshold={threshold_used}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
