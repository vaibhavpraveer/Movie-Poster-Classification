import React from 'react';
import { Film, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050608] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand identity */}
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-wider">
              FRAME<span className="text-purple-400">//</span>AI
            </span>
          </div>
          <p className="text-xs text-gray-400 font-light">
            Every poster tells a story. Our AI reads it.
          </p>
          <div className="text-[11px] font-mono text-gray-400">
            Powered by MobileNetV2 Deep Feature Extraction & Multi-Label Sigmoid Activation
          </div>
        </div>

        {/* Links & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center space-x-6 text-xs text-gray-400 font-medium">
            <a
              href="#studio"
              className="hover:text-purple-400 transition-colors"
            >
              Analysis Studio
            </a>
            <a
              href="#explore"
              className="hover:text-purple-400 transition-colors"
            >
              Benchmark Gallery
            </a>
            <a
              href="#intelligence"
              className="hover:text-purple-400 transition-colors"
            >
              Model Architecture
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="p-3 rounded-xl glass-panel-interactive border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 font-mono gap-4">
        <div>FRAME//AI Neural Poster Classification System • Real ML Runtime</div>
        <div>Trained on 19 Cinematic Categories</div>
      </div>
    </footer>
  );
};
