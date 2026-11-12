import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Terminal, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar({ health, championModel, onNavigateToConsole }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHealthy = health?.status === 'healthy';

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Barre d'annonce supérieure */}
      <div className="bg-gradient-to-r from-violet-950 via-obsidian-900 to-cyan-950 border-b border-violet-900/40 text-xs py-2 px-4 text-center text-slate-300 flex items-center justify-center space-x-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-600/30 text-violet-300 border border-violet-500/40">
          CIC-IDS2017 Dataset
        </span>
        <span className="hidden sm:inline">Modèles Random Forest & XGBoost avec split stratifié anti-fuite.</span>
        <a
          href="#console"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('console');
          }}
          className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center space-x-1 underline decoration-cyan-500/40"
        >
          <span>Tester la console en direct</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* Barre de navigation principale avec effet verre dépoli (Glassmorphism) */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-obsidian-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-2xl'
            : 'bg-obsidian-950/50 backdrop-blur-sm border-b border-slate-800/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo style terminal modernisé */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hero');
              }}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-950/50">
                <div className="w-full h-full bg-obsidian-950 rounded-[7px] flex items-center justify-center text-cyan-400 group-hover:text-white transition">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono text-cyan-400 text-sm font-semibold">&gt;_</span>
                  <span className="font-bold text-white tracking-tight text-base font-mono">attack_watcher</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5">
                  ml ddos detection
                </span>
              </div>
            </a>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center space-x-7 text-xs font-medium text-slate-300">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-cyan-400 transition"
              >
                Présentation
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-cyan-400 transition"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('console')}
                className="hover:text-cyan-400 transition flex items-center space-x-1 text-violet-300 hover:text-violet-200"
              >
                <span>Console Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              </button>
              <button
                onClick={() => scrollToSection('benchmark')}
                className="hover:text-cyan-400 transition"
              >
                Benchmark ML
              </button>
              <button
                onClick={() => scrollToSection('architecture')}
                className="hover:text-cyan-400 transition"
              >
                Architecture
              </button>
            </div>

            {/* Actions à droite */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Modèle Actif */}
              <div className="hidden md:flex items-center space-x-2 bg-obsidian-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-slate-400">Modèle:</span>
                <span className="font-medium text-slate-200">{championModel || 'RandomForest'}</span>
              </div>

              {/* Statut API */}
              <div className="flex items-center space-x-2 bg-obsidian-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span className="text-slate-400">API:</span>
                <span className="font-medium text-slate-200">{isHealthy ? 'En ligne' : 'Connexion...'}</span>
              </div>

              {/* Bouton CTA d'accès direct */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onNavigateToConsole) onNavigateToConsole();
                  scrollToSection('console');
                }}
                className="relative group overflow-hidden rounded-lg p-[1px] font-semibold text-xs text-white"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-lg group-hover:opacity-90 transition"></span>
                <span className="relative flex items-center space-x-2 bg-obsidian-950 px-4 py-2 rounded-[7px] transition group-hover:bg-opacity-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
                  <span>Lancer la Détection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </span>
              </motion.button>
            </div>

            {/* Bouton menu mobile */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-obsidian-900 border border-slate-800 text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu déroulant mobile */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-obsidian-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3"
          >
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-cyan-400"
            >
              Présentation
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-cyan-400"
            >
              Fonctionnalités
            </button>
            <button
              onClick={() => scrollToSection('console')}
              className="block w-full text-left py-2 text-sm text-cyan-400 font-semibold"
            >
              Console Active (Détection en direct)
            </button>
            <button
              onClick={() => scrollToSection('benchmark')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-cyan-400"
            >
              Benchmark ML
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="block w-full text-left py-2 text-sm text-slate-300 hover:text-cyan-400"
            >
              Architecture & Documentation
            </button>
          </motion.div>
        )}
      </nav>
    </>
  );
}
