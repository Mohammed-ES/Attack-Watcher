import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HelloSection from './components/HelloSection';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesGridSection from './components/FeaturesGridSection';
import ConsoleSection from './components/ConsoleSection';
import CtaBannerSection from './components/CtaBannerSection';
import Footer from './components/Footer';
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
      {/* Barre de navigation flottante façon pilule */}
      <Navbar onNavigateToConsole={scrollToConsole} />

      {/* 1. HELLO SECTION : Présente d'abord le logo .GIF officiel avec invitation au scroll */}
      <HelloSection onExplore={scrollToHero} />

      {/* 2. HERO SECTION : Style cinématique Morve / Aura avec boutons sci-fi et typographie en 3 lignes */}
      <HeroSection onLaunchConsole={scrollToConsole} />

      {/* 3. Section "How it works" avec l'accordéon interactif 01, 02, 03, 04 */}
      <HowItWorksSection />

      {/* 4. Section "Intelligence at every layer" avec la grille de 6 cartes */}
      <FeaturesGridSection />

      {/* 5. Console Interactive en direct (Saisie Manuelle 10 features & Analyse CSV avec Recharts et pagination) */}
      <ConsoleSection featuresMetadata={featuresMetadata} />

      {/* 6. Bannière d'appel à l'action bicolore (Noir + Bleu Royal) */}
      <CtaBannerSection onLaunchConsole={scrollToConsole} />

      {/* 7. Pied de page épuré */}
      <Footer />
    </div>
  );
}
