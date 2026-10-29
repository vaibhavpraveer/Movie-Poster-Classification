import React from 'react';
import { Palette, Type, Compass, Eye } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
          <Eye className="w-3.5 h-3.5" />
          <span>VISUAL COGNITION & CINEMATIC TROPES</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight">
          How The AI Reads The Poster
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          Movie posters are intentionally engineered visual psychological anchors. Our deep learning model learns to identify the aesthetic language directors and designers encode into every frame.
        </p>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pillar 1: Chromatic Harmony */}
        <div className="p-8 rounded-3xl glass-panel-interactive border border-white/10 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Palette className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">
            Chromatic Signatures
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Genre conventions dictate strict color palettes. Horror leans on desaturated deep blacks and violent crimson. Sci-Fi relies on electric cyan and deep ultraviolet. Romances prioritize warm golden-hour gradations.
          </p>
          <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Learned color histograms</span>
          </div>
        </div>

        {/* Pillar 2: Typography & Lettering */}
        <div className="p-8 rounded-3xl glass-panel-interactive border border-white/10 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <Type className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">
            Typography & Stylization
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            The font treatment on title treatments strongly signals genre. Heavy distressed sans-serifs cue Action and Thrillers, while ornate classical serifs signify Period Drama, and whimsical soft lettering reveals Animation.
          </p>
          <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-pink-300">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>High-frequency spatial edges</span>
          </div>
        </div>

        {/* Pillar 3: Composition & Spatial Dynamics */}
        <div className="p-8 rounded-3xl glass-panel-interactive border border-white/10 space-y-4 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-heading">
            Spatial Composition
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Floating ensemble heads signify ensemble Comedy or Drama. Diagonal speed lines and high-velocity stances indicate Action. Isolated figures amidst vast negative space establish psychological Thriller tension.
          </p>
          <div className="pt-2 flex items-center space-x-2 text-xs font-mono text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Convolutional receptive fields</span>
          </div>
        </div>
      </div>
    </section>
  );
};
