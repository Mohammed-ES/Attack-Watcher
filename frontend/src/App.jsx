import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HelloSection from './components/HelloSection';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesGridSection from './components/FeaturesGridSection';
import BenchmarkSection from './components/BenchmarkSection';
import ConsoleSection from './components/ConsoleSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import GlobalAsciiCanvas from './components/GlobalAsciiCanvas';
import { getHealth, getModelInfo } from './services/api';

export default function App() {
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [_, infoRes] = await Promise.all([
          getHealth().catch(() => null),
          getModelInfo().catch(() => null),
        ]);
        setModelInfo(infoRes);
      } catch (e) {
        console.error('Erreur initialisation frontend:', e);
      }
    }
    init();
  }, []);

  const scrollToConsole = () => {
    const consoleEl = document.getElementById('console');
    if (consoleEl) {
      consoleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHero = () => {
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-blue-600 selection:text-white flex flex-col antialiased relative">
      {/* Barre de navigation flottante façon pilule */}
      <Navbar onNavigateToConsole={scrollToConsole} />

      {/* 1. HELLO SECTION : Présentation plein écran du logo */}
      <HelloSection onExplore={scrollToHero} />

      {/* Flux Sombre Continu : Matrice ASCII interactive */}
      <div className="relative bg-black isolate">
        {/* Fond ASCII interactif global */}
        <GlobalAsciiCanvas />

        {/* 2. HERO SECTION : Detection That Scales */}
        <HeroSection onLaunchConsole={scrollToConsole} />

        {/* 3. Section "How it works" */}
        <HowItWorksSection />

        {/* 4. Section "Intelligence at every layer" */}
        <FeaturesGridSection />

        {/* 5. Section Métriques réelles et Évaluation Modèle */}
        <BenchmarkSection />

        {/* 6. Console Interactive en direct (Saisie Manuelle 9 features & Analyse CSV) */}
        <ConsoleSection featuresMetadata={modelInfo} />

        {/* 7. Section "Questions, answered" : Foire aux questions */}
        <FaqSection />

        {/* 8. Pied de page */}
        <Footer />
      </div>
    </div>
  );
}
