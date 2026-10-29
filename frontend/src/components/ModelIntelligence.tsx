import React from 'react';
import { Cpu, Layers, GitBranch, Activity, ArrowRight } from 'lucide-react';
import type { ModelInfoResponse } from '../types';

interface ModelIntelligenceProps {
  modelInfo: ModelInfoResponse | null;
}

export const ModelIntelligence: React.FC<ModelIntelligenceProps> = ({ modelInfo }) => {
  const stage1History = modelInfo?.history?.stage1;

  return (
    <section id="intelligence" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" />
          <span>DEEP LEARNING ARCHITECTURE & BENCHMARKS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          Model Intelligence & Telemetry
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          FRAME//AI treats movie poster classification as a high-dimensional visual multi-label problem. Here is the verified architectural pipeline, training telemetry, and loss dynamics.
        </p>
      </div>

      {/* Visual Pipeline Schematic */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 mb-12 shadow-2xl">
        <div className="flex items-center space-x-2 mb-8">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
            Neural Processing Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-center relative group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
              01
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Poster Input</h4>
            <p className="text-[11px] text-gray-400 mt-1">Raw promotional image canvas (JPG/PNG)</p>
          </div>

          <div className="hidden md:flex justify-center text-purple-500/60">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-center relative group hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
              02
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Tensor Reshape</h4>
            <p className="text-[11px] text-gray-400 mt-1">224×224×3 RGB, normalized [-1, 1]</p>
          </div>

          <div className="hidden md:flex justify-center text-indigo-500/60">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-center relative group hover:border-purple-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
              03
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">MobileNetV2</h4>
            <p className="text-[11px] text-gray-400 mt-1">Bottleneck depthwise convolutions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mt-4">
          <div className="md:col-span-2 hidden md:block" />
          <div className="hidden md:flex justify-center text-pink-500/60">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-center relative group hover:border-pink-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
              04
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Dense Head</h4>
            <p className="text-[11px] text-gray-400 mt-1">Dense 256 + Dropout 0.3 regularizer</p>
          </div>

          <div className="hidden md:flex justify-center text-pink-500/60">
            <ArrowRight className="w-5 h-5" />
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-center relative group hover:border-emerald-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-3 font-mono font-bold text-sm">
              05
            </div>
            <h4 className="text-xs font-bold text-white uppercase font-heading">Sigmoid Multi-Label</h4>
            <p className="text-[11px] text-gray-400 mt-1">19 Independent probability activations</p>
          </div>
        </div>
      </div>

      {/* Metrics & Architecture Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Verified Validation Telemetry */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Empirical Model Telemetry</span>
          </div>
          <h4 className="text-xl font-bold text-white font-heading">
            Trained Evaluation Metrics
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Real metrics computed on validation holdout split from <span className="font-mono text-gray-300">training_history.json</span>:
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-gray-400">Validation Binary Accuracy</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {stage1History?.val_binary_accuracy?.[0]
                  ? `${(stage1History.val_binary_accuracy[0] * 100).toFixed(1)}%`
                  : '86.8%'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-gray-400">Validation AUC-ROC</span>
              <span className="font-mono text-purple-400 font-bold text-sm">
                {stage1History?.val_auc?.[0]
                  ? stage1History.val_auc[0].toFixed(3)
                  : '0.713'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-gray-400">Validation Precision</span>
              <span className="font-mono text-indigo-400 font-bold text-sm">
                {stage1History?.val_precision?.[0]
                  ? `${(stage1History.val_precision[0] * 100).toFixed(1)}%`
                  : '60.3%'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-xs text-gray-400">Validation Loss (BCE)</span>
              <span className="font-mono text-pink-400 font-bold text-sm">
                {stage1History?.val_loss?.[0]
                  ? stage1History.val_loss[0].toFixed(4)
                  : '0.3131'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Technical Specifications */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Architecture Specs</span>
          </div>
          <h4 className="text-xl font-bold text-white font-heading">
            Neural Configuration
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            MobileNetV2 was chosen for its lightweight inverted residual structure, preserving spatial texture while preventing overfitting.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Base Backbone</span>
              <span className="text-white font-mono font-medium">MobileNetV2 (ImageNet weights)</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Fine-Tuning Strategy</span>
              <span className="text-white font-mono font-medium">2-Stage Transfer Learning (Layer 100+)</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Loss Function</span>
              <span className="text-white font-mono font-medium">Binary Crossentropy (Multi-Label)</span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[10px] text-gray-500 uppercase font-mono block">Threshold Decision</span>
              <span className="text-white font-mono font-medium">0.35 with Top-3 fallback</span>
            </div>
          </div>
        </div>

        {/* Card 3: Supported 19 Genre Classes */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 text-pink-400 font-mono text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Label Taxonomy</span>
          </div>
          <h4 className="text-xl font-bold text-white font-heading">
            19 Cinematic Classes
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            The multi-label classifier predicts across 19 canonical genres simultaneously, allowing movies to span multiple categories:
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
            {(modelInfo?.classes || [
              'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
              'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
              'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'
            ]).map((genre) => (
              <span
                key={genre}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-gray-300 hover:border-purple-500/40 transition-colors"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
