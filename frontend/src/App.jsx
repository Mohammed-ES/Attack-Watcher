import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HelloSection from './components/HelloSection';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesGridSection from './components/FeaturesGridSection';
import ConsoleSection from './components/ConsoleSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import GlobalAsciiCanvas from './components/GlobalAsciiCanvas';
import { getHealth, getFeaturesMetadata } from './services/api';

export default function App() {
  const [featuresMetadata, setFeaturesMetadata] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [_, featRes] = await Promise.all([
          getHealth().catch(() => null),
          getFeaturesMetadata().catch(() => null),
        ]);
        setFeaturesMetadata(featRes);
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
      {/* Barre de navigation flottante façon pilule (apparaît lors de l'accès au Hero) */}
      <Navbar onNavigateToConsole={scrollToConsole} />

      {/* 1. HELLO SECTION : Présentation plein écran du logo .GIF sans header */}
      <HelloSection onExplore={scrollToHero} />

      {/* Flux Sombre Continu : Matrice ASCII interactive au curseur du Hero jusqu'au Footer */}
      <div className="relative bg-black isolate">
        {/* Fond ASCII interactif global */}
        <GlobalAsciiCanvas />

        {/* 2. HERO SECTION : Style Aura.build "Detection That Scales." avec orgues lumineuses */}
        <HeroSection onLaunchConsole={scrollToConsole} />

        {/* 3. Section "How it works" : Cartes interactives synchronisées avec scroll motion */}
        <HowItWorksSection />

        {/* 4. Section "Intelligence at every layer" : Grille 6 cartes modernes avec background et animations */}
        <FeaturesGridSection />

        {/* 5. Console Interactive en direct (Saisie Manuelle 10 features & Analyse CSV) */}
        <ConsoleSection featuresMetadata={featuresMetadata} />

        {/* 6. Section "Questions, answered" : Foire aux questions technique interactive */}
        <FaqSection />

        {/* 7. Pied de page épuré */}
        <Footer />
      </div>
    </div>
  );
}
