import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenchmarkSection from './components/BenchmarkSection';
import ArchitectureSection from './components/ArchitectureSection';
import Footer from './components/Footer';
import ManualPrediction from './components/ManualPrediction';
import CsvPrediction from './components/CsvPrediction';
import { Sliders, FileSpreadsheet } from 'lucide-react';
import { getHealth, getFeaturesMetadata } from './services/api';

export default function App() {
  const [activeConsoleTab, setActiveConsoleTab] = useState('manual');
  const [health, setHealth] = useState(null);
  const [featuresMetadata, setFeaturesMetadata] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [healthRes, featRes] = await Promise.all([
          getHealth().catch(() => null),
          getFeaturesMetadata().catch(() => null),
        ]);
        setHealth(healthRes);
        setFeaturesMetadata(featRes);
      } catch (e) {
        console.error('Erreur initialisation frontend:', e);
      }
    }
    init();
  }, []);

  const scrollToConsole = (tab = 'manual') => {
    setActiveConsoleTab(tab);
    const consoleEl = document.getElementById('console');
    if (consoleEl) {
      consoleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 cyber-grid selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Barre de navigation modernisée */}
      <Navbar
        health={health}
        championModel={featuresMetadata?.champion_model || health?.champion_model}
        onNavigateToConsole={() => scrollToConsole('manual')}
      />

      {/* Hero Section façon Landing Page avec Maquette Isométrique */}
      <HeroSection
        onStartClick={() => scrollToConsole('manual')}
        onCsvClick={() => scrollToConsole('csv')}
      />

      {/* Cartes de fonctionnalités avec animations au scroll */}
      <FeaturesSection />

      {/* Section Console Interactive (Fonctionnalités conservées intégralement) */}
      <section id="console" className="py-20 border-t border-slate-800/80 bg-obsidian-950/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de la Console */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800/80 gap-4">
            <div>
              <div className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
                # Moteur d'Inférence Actif
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Console d'Analyse Réseau en Direct
              </h2>
              <p className="text-slate-300 text-sm mt-2 font-light">
                Effectuez une inférence unitaire sur 10 métriques ou traitez par lot des captures CSV.
              </p>
            </div>

            {/* Commutateur d'onglets de la Console */}
            <div className="flex items-center p-1 bg-obsidian-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveConsoleTab('manual')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeConsoleTab === 'manual'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Saisie Manuelle</span>
              </button>

              <button
                onClick={() => setActiveConsoleTab('csv')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeConsoleTab === 'csv'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Analyse Fichier CSV</span>
              </button>
            </div>
          </div>

          {/* Affichage de l'outil sélectionné */}
          {activeConsoleTab === 'manual' ? (
            <ManualPrediction featuresMetadata={featuresMetadata} />
          ) : (
            <CsvPrediction />
          )}
        </div>
      </section>

      {/* Section Benchmark & Matrice de Confusion */}
      <BenchmarkSection featuresMetadata={featuresMetadata} />

      {/* Section Architecture Technique */}
      <ArchitectureSection />

      {/* Pied de page moderne */}
      <Footer />
    </div>
  );
}
