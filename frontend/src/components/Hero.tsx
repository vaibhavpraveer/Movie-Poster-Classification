import React from 'react';
import { Sparkles, ArrowRight, Play, Layers } from 'lucide-react';
import type { HealthStatus, SamplePoster } from '../types';

interface HeroProps {
  health: HealthStatus;
  samplePosters: SamplePoster[];
  onAnalyzeClick: () => void;
  onExploreClick: () => void;
  onSelectSample: (sample: SamplePoster) => void;
}

export const Hero: React.FC<HeroProps> = ({
  health,
  samplePosters,
  onAnalyzeClick,
  onExploreClick,
  onSelectSample,
}) => {
  // Use first 3 samples or high-contrast cinema visuals
  const featuredSamples = samplePosters.slice(0, 3);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
      {/* Cinematic Ambient Background Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-purple-900/30 via-indigo-900/20 to-pink-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-700/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-red-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Editorial Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Tag / Live Status pill */}
            <div className="inline-flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health.status === 'online' ? 'bg-purple-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health.status === 'online' ? 'bg-purple-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-xs uppercase tracking-widest font-mono text-gray-300">
                {health.status === 'online'
                  ? `Neural Engine v1.0 • 19 Film Genres Active`
                  : 'Engine Standby • Connecting to Host...'}
              </span>
            </div>

            {/* Oversized Cinematic Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              THE GENRE IS WRITTEN IN THE{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-300 drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]">
                  FRAME.
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 rounded-full opacity-80" />
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
              Every poster tells a story. Our AI reads it. Powered by a custom deep-learning model fine-tuned on thousands of movie canvases to decode visual tropes, tonal palettes, and composition into instantaneous multi-label genre intelligence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="group relative px-8 py-4 rounded-xl font-semibold text-base text-white overflow-hidden shadow-2xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 group-hover:scale-105 transition-transform duration-300" />
                <div className="relative flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
                  <span>Analyze a Poster</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={onExploreClick}
                className="px-7 py-4 rounded-xl font-medium text-base text-gray-300 hover:text-white glass-panel-interactive border border-white/10 hover:border-purple-500/40 transition-all flex items-center space-x-2.5 cursor-pointer"
              >
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Explore the Intelligence</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.08] max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-white">19</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Genres Mapped</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-purple-400">Multi-Label</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Hybrid Classification</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-pink-400">MobileNetV2</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Deep Backbone</div>
              </div>
            </div>
          </div>

          {/* Right Column: Cinematic Asymmetrical Poster Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full max-w-md mx-auto aspect-[3/4] flex items-center justify-center">
              {/* Back Card - Asymmetric Tilt */}
              <div className="absolute w-[80%] aspect-[2/3] -top-6 -left-4 rounded-2xl overflow-hidden shadow-2xl opacity-40 border border-white/10 -rotate-6 transform hover:rotate-0 transition-transform duration-500">
                <img
                  src={featuredSamples[1]?.image_url || 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg'}
                  alt="Poster preview back"
                  className="w-full h-full object-cover filter saturate-75 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-transparent" />
              </div>

              {/* Front Primary Hero Poster Showcase */}
              <div className="relative z-10 w-[88%] aspect-[2/3] rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] group">
                <img
                  src={featuredSamples[0]?.image_url || 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg'}
                  alt="Primary Hero Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Laser scanline overlay animation */}
                <div className="laser-scanner" />

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/20 pointer-events-none" />

                {/* Floating Prediction Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="px-3 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-purple-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI RECOGNITION ACTIVE</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-purple-600/80 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider">
                    74.4% CONFIDENCE
                  </div>
                </div>

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 z-20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-purple-400 tracking-wider">Detected Primary</div>
                      <div className="text-lg font-bold text-white font-heading">Action & Adventure</div>
                    </div>
                    {featuredSamples[0] && (
                      <button
                        onClick={() => onSelectSample(featuredSamples[0])}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                        title="Analyze this exact poster"
                      >
                        <span>Test This</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </div>

                  {/* Multi-label probability bars */}
                  <div className="space-y-1.5 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-300 mb-1">
                        <span>Action</span>
                        <span className="text-purple-400">74.4%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[74.4%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-gray-300 mb-1">
                        <span>Adventure</span>
                        <span className="text-pink-400">65.6%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full w-[65.6%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Holographic Ring */}
              <div className="absolute -inset-4 border border-purple-500/20 rounded-3xl -z-10 pointer-events-none transform rotate-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
