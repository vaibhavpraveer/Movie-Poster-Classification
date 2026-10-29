import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PosterStudio } from './components/PosterStudio';
import { SampleGallery } from './components/SampleGallery';
import { ModelIntelligence } from './components/ModelIntelligence';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { api } from './services/api';
import type { HealthStatus, ModelInfoResponse, SamplePoster } from './types';

export function App() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'offline',
    model_ready: false,
  });
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [samples, setSamples] = useState<SamplePoster[]>([]);
  const [selectedSampleForStudio, setSelectedSampleForStudio] = useState<SamplePoster | null>(null);

  // Initial load: Health, Model Intelligence, and Archive Samples
  useEffect(() => {
    let isMounted = true;

    const checkServiceHealth = async () => {
      const h = await api.checkHealth();
      if (isMounted) setHealth(h);
    };

    const loadIntelAndSamples = async () => {
      try {
        const info = await api.getModelInfo();
        if (isMounted) setModelInfo(info);
      } catch (err) {
        console.warn('Could not fetch model info:', err);
      }

      try {
        const s = await api.getSamples(12);
        if (isMounted && s.samples) {
          setSamples(s.samples);
        }
      } catch (err) {
        console.warn('Could not fetch samples:', err);
      }
    };

    checkServiceHealth();
    loadIntelAndSamples();

    // Periodic health heartbeat every 20s
    const heartbeat = setInterval(checkServiceHealth, 20000);

    return () => {
      isMounted = false;
      clearInterval(heartbeat);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSample = (sample: SamplePoster) => {
    setSelectedSampleForStudio(sample);
    scrollToSection('studio');
  };

  return (
    <div className="relative min-h-screen bg-[#08090D] text-[#E2E8F0] overflow-x-hidden selection:bg-purple-600 selection:text-white">
      {/* Subtle Atmospheric Film Grain Texture */}
      <div className="fixed inset-0 pointer-events-none film-grain z-50 opacity-40" />

      {/* Primary Top Navigation */}
      <Navbar
        health={health}
        onNavigateToStudio={() => scrollToSection('studio')}
        onNavigateToExplore={() => scrollToSection('explore')}
        onNavigateToIntelligence={() => scrollToSection('intelligence')}
        onNavigateToHowItWorks={() => scrollToSection('how-it-works')}
      />

      <main>
        {/* Cinematic Hero */}
        <Hero
          health={health}
          samplePosters={samples}
          onAnalyzeClick={() => scrollToSection('studio')}
          onExploreClick={() => scrollToSection('intelligence')}
          onSelectSample={handleSelectSample}
        />

        {/* Poster Analysis Studio (Interactive Main Feature) */}
        <PosterStudio
          externalSampleToLoad={selectedSampleForStudio}
          onClearExternalSample={() => setSelectedSampleForStudio(null)}
        />

        {/* Benchmark Samples Gallery */}
        <SampleGallery
          samples={samples}
          onSelectSample={handleSelectSample}
        />

        {/* Visual Cognition / How It Works */}
        <HowItWorks />

        {/* Model Intelligence & Technical Telemetry */}
        <ModelIntelligence modelInfo={modelInfo} />
      </main>

      {/* Cinematic Footer */}
      <Footer />
    </div>
  );
}

export default App;
