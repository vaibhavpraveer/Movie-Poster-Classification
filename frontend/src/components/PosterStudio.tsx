import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Trash2,
  Sliders,
  AlertCircle,
  Cpu,
  Film,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import type { PredictionResponse, SamplePoster } from '../types';
import { PredictionResults } from './PredictionResults';

interface PosterStudioProps {
  externalSampleToLoad: SamplePoster | null;
  onClearExternalSample: () => void;
}

const ANALYSIS_STAGES = [
  'Receiving frame bytes & validating header...',
  'Normalizing color space & resizing to 224×224 RGB...',
  'Executing MobileNetV2 deep convolution inference...',
  'Synthesizing multi-label probability matrix...',
];

export const PosterStudio: React.FC<PosterStudioProps> = ({
  externalSampleToLoad,
  onClearExternalSample,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(0.35);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStageIdx, setAnalysisStageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isSampleMode, setIsSampleMode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If a sample was selected from the gallery or hero, load it automatically into the studio!
  useEffect(() => {
    if (externalSampleToLoad) {
      setSelectedFile(null);
      setIsSampleMode(externalSampleToLoad.id);
      setPreviewUrl(api.getSampleImageUrl(externalSampleToLoad.id));
      setPrediction(null);
      setError(null);
      onClearExternalSample();
    }
  }, [externalSampleToLoad, onClearExternalSample]);

  // Cycle through real-time animation stages during inference
  useEffect(() => {
    if (!isAnalyzing) {
      setAnalysisStageIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setAnalysisStageIdx((prev) => (prev < ANALYSIS_STAGES.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Image file is too large. Maximum supported size is 20MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setIsSampleMode(null);
    setPrediction(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setIsSampleMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#38BDF8', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile && !isSampleMode) {
      setError('Please select or upload a poster image first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      let res: PredictionResponse;
      if (selectedFile) {
        res = await api.predictImage(selectedFile, threshold);
      } else if (isSampleMode) {
        res = await api.predictSample(isSampleMode, threshold);
      } else {
        throw new Error('No target poster selected');
      }

      setPrediction(res);
      triggerConfetti();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please check backend connection.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section id="studio" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <Film className="w-3.5 h-3.5" />
          <span>CINEMATIC INFERENCE WORKSPACE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          Poster Analysis Studio
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Feed any movie poster or film promotional frame into the neural engine. The vision model extracts chromatic signatures, lighting keys, and spatial typography.
        </p>
      </div>

      {/* Main Studio Frame */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 border border-white/10 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Light */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* View Mode: Active Prediction Results */}
        {prediction && previewUrl ? (
          <PredictionResults
            prediction={prediction}
            imageUrl={previewUrl}
            imageName={selectedFile?.name || (isSampleMode ? `Archive Sample ${isSampleMode}` : undefined)}
            onReset={handleReset}
          />
        ) : (
          /* View Mode: Upload / Configure / Analyze */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Interactive Drop Zone or Loaded Viewport */}
            <div className="lg:col-span-7">
              {previewUrl ? (
                /* Loaded Poster Preview Card */
                <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-2xl overflow-hidden glass-panel border border-purple-500/30 shadow-2xl group">
                  <img
                    src={previewUrl}
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Laser Scanning Overlay during inference */}
                  {isAnalyzing && <div className="laser-scanner" />}

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Floating Controls */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                    <div className="px-3 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-purple-300">
                      READY FOR INFERENCE
                    </div>
                    <button
                      onClick={handleReset}
                      disabled={isAnalyzing}
                      className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bottom Image Filename Info */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 z-20 flex items-center justify-between">
                    <div className="truncate mr-3">
                      <div className="text-[10px] font-mono uppercase text-gray-400">Target</div>
                      <div className="text-xs font-semibold text-white truncate">
                        {selectedFile?.name || (isSampleMode ? `Sample: ${isSampleMode}` : 'Loaded Poster')}
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="text-xs font-medium text-purple-400 hover:text-purple-300 whitespace-nowrap cursor-pointer"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full max-w-md mx-auto aspect-[2/3] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer group ${
                    isDragging
                      ? 'border-purple-400 bg-purple-950/20 scale-[1.01]'
                      : 'border-white/15 hover:border-purple-500/40 bg-black/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-600/20 transition-all">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>

                  <h3 className="text-xl font-bold text-white font-heading mb-2">
                    Upload Movie Poster
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
                    Drag and drop your poster file here, or click to browse your local files. Supports JPG, PNG, WebP up to 20MB.
                  </p>

                  <div className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                    Browse Local File
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelection(e.target.files[0]);
                  }
                }}
              />
            </div>

            {/* Right: Inference Controls & Pipeline HUD */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-purple-400">
                  Model Tuning
                </div>
                <h3 className="text-2xl font-bold text-white font-heading">
                  Inference Parameters
                </h3>
                <p className="text-xs text-gray-400">
                  Configure the multi-label sigmoid probability threshold. The model predicts all genres scoring at or above this cut-off.
                </p>
              </div>

              {/* Threshold Slider Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-gray-300 font-medium">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Sensitivity Threshold</span>
                  </div>
                  <span className="font-mono text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                    {(threshold * 100).toFixed(0)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.05"
                  max="0.85"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  disabled={isAnalyzing}
                  className="w-full accent-purple-500 bg-gray-800 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>5% (Permissive / Multi)</span>
                  <span>Default: 35%</span>
                  <span>85% (Selective / Single)</span>
                </div>
              </div>

              {/* Neural Preprocessing Specs */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <div className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pipeline Specifications</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Input Tensor</span>
                    <span className="font-mono text-white text-[11px] font-medium">224 × 224 × 3</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Feature Extractor</span>
                    <span className="font-mono text-white text-[11px] font-medium">MobileNetV2</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Activation</span>
                    <span className="font-mono text-white text-[11px] font-medium">Sigmoid Multi-Label</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-gray-400 text-[10px] block">Genre Classes</span>
                    <span className="font-mono text-white text-[11px] font-medium">19 Categories</span>
                  </div>
                </div>
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-semibold block mb-0.5">Analysis Failed</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Main Animated CTA Button */}
              <button
                onClick={handleAnalyze}
                disabled={(!selectedFile && !isSampleMode) || isAnalyzing}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center space-x-3 transition-all relative overflow-hidden cursor-pointer shadow-xl ${
                  !selectedFile && !isSampleMode
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                    : isAnalyzing
                    ? 'bg-purple-950 text-purple-200 border border-purple-500/40 cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-sm">{ANALYSIS_STAGES[analysisStageIdx]}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-200" />
                    <span className="font-heading uppercase tracking-wider">
                      {previewUrl ? 'Analyze Frame' : 'Upload A Poster to Begin'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
