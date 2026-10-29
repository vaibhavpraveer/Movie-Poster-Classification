import React from 'react';
import { Film, Play, ArrowUpRight } from 'lucide-react';
import type { SamplePoster } from '../types';

interface SampleGalleryProps {
  samples: SamplePoster[];
  onSelectSample: (sample: SamplePoster) => void;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({ samples, onSelectSample }) => {
  return (
    <section id="explore" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-mono mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>ARCHIVAL DEMO SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
            Cinematic Test Gallery
          </h2>
          <p className="text-gray-400 max-w-xl text-sm sm:text-base mt-2">
            Explore authentic movie posters from our evaluation catalog. Click &ldquo;Test This Poster&rdquo; to send any frame directly to the live neural inference pipeline.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 self-start md:self-auto">
          Cataloged: <span className="text-purple-400 font-bold">{samples.length} Benchmark Frames</span>
        </div>
      </div>

      {/* Grid of Posters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(139,92,246,0.3)] flex flex-col"
          >
            {/* Poster Image Container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
              <img
                src={sample.image_url}
                alt={sample.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Hover Overlay with "Test" CTA */}
              <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 text-center">
                <button
                  onClick={() => onSelectSample(sample)}
                  className="px-3.5 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center space-x-1.5 shadow-xl hover:bg-purple-100 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-purple-600" />
                  <span>Run Inference</span>
                </button>
                <span className="text-[10px] text-purple-200 mt-2 font-mono">
                  Loads into Studio
                </span>
              </div>
            </div>

            {/* Poster Details Bar */}
            <div className="p-3 bg-[#0D1018]/90 flex flex-col justify-between flex-1">
              <div>
                <h4 className="font-heading font-bold text-white text-xs truncate group-hover:text-purple-300 transition-colors" title={sample.title}>
                  {sample.title}
                </h4>
                {/* Official Genre Tags */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {sample.official_genres.slice(0, 2).map((g) => (
                    <span
                      key={g}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-300 border border-white/5 truncate"
                    >
                      {g}
                    </span>
                  ))}
                  {sample.official_genres.length > 2 && (
                    <span className="text-[9px] font-mono text-gray-500">
                      +{sample.official_genres.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Trigger */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                <span className="font-mono text-purple-400">ID: {sample.id.split('.')[0]}</span>
                <button
                  onClick={() => onSelectSample(sample)}
                  className="text-gray-400 hover:text-white flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>Test</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
