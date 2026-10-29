import React from 'react';
import { Sparkles, Film, Cpu, ChevronRight } from 'lucide-react';
import type { HealthStatus } from '../types';

interface NavbarProps {
  health: HealthStatus;
  onNavigateToStudio: () => void;
  onNavigateToExplore: () => void;
  onNavigateToIntelligence: () => void;
  onNavigateToHowItWorks: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  onNavigateToStudio,
  onNavigateToExplore,
  onNavigateToIntelligence,
  onNavigateToHowItWorks,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#08090D]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-red-500 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <div className="w-full h-full bg-[#08090D] rounded-xl flex items-center justify-center">
                <Film className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 -z-10" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-xl tracking-wider text-white">
                FRAME<span className="text-purple-400">//</span>AI
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                v1.0 ML
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Every poster tells a story. Our AI reads it.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <button
            onClick={onNavigateToStudio}
            className="hover:text-purple-400 transition-colors cursor-pointer text-left"
          >
            Studio
          </button>
          <button
            onClick={onNavigateToExplore}
            className="hover:text-purple-400 transition-colors cursor-pointer text-left"
          >
            Archive & Samples
          </button>
          <button
            onClick={onNavigateToHowItWorks}
            className="hover:text-purple-400 transition-colors cursor-pointer text-left"
          >
            How It Works
          </button>
          <button
            onClick={onNavigateToIntelligence}
            className="hover:text-purple-400 transition-colors cursor-pointer text-left flex items-center space-x-1"
          >
            <span>Model Insights</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </nav>

        {/* Health Status & CTA */}
        <div className="flex items-center space-x-4">
          {/* Live Status Pill */}
          <div
            className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-md transition-all ${
              health.status === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title={health.status === 'online' ? `Connected: ${health.backbone} model loaded` : 'Backend service unreachable'}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  health.status === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  health.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {health.status === 'online' ? 'MobileNetV2 Online' : 'Model Disconnected'}
            </span>
            {health.latency_ms !== undefined && (
              <span className="text-[10px] text-gray-400 border-l border-white/10 pl-1.5">
                {health.latency_ms}ms
              </span>
            )}
          </div>

          {/* Primary Action */}
          <button
            onClick={onNavigateToStudio}
            className="relative group px-4 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm tracking-wide text-white transition-all overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 group-hover:opacity-90 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Analyze Poster</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
