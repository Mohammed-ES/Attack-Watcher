import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import FeaturesGridSection from './components/FeaturesGridSection';
import ConsoleSection from './components/ConsoleSection';
import CtaBannerSection from './components/CtaBannerSection';
import Footer from './components/Footer';
import { ScrollProgressBar } from './animations';
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

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-blue-600 selection:text-white flex flex-col antialiased relative">
      {/* Barre de progression fluide au scroll (Framer Motion) */}
      <ScrollProgressBar />

      {/* Barre de navigation flottante façon pilule */}
      <Navbar onNavigateToConsole={scrollToConsole} />

      {/* Hero Section "Detection That Scales." avec faisceaux Aura et Hello Showcase GIF */}
      <HeroSection onLaunchConsole={scrollToConsole} />

      {/* Section "How it works" avec l'accordéon interactif 01, 02, 03, 04 */}
      <HowItWorksSection />

      {/* Section "Intelligence at every layer" avec la grille de 6 cartes */}
      <FeaturesGridSection />

      {/* Console Interactive en direct (Saisie Manuelle 10 features & Analyse CSV avec Recharts et pagination) */}
      <ConsoleSection featuresMetadata={featuresMetadata} />

      {/* Bannière d'appel à l'action bicolore (Noir + Bleu Royal) */}
      <CtaBannerSection onLaunchConsole={scrollToConsole} />

      {/* Pied de page épuré */}
      <Footer />
    </div>
  );
}
