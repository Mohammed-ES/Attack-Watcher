import { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ onNavigateToConsole }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all">
      <div
        className={`w-full max-w-6xl rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80'
            : 'bg-black/40 backdrop-blur-md border border-white/5'
        }`}
      >
        {/* Logo minimaliste */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('hero');
          }}
          className="flex items-center space-x-2.5 text-white group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition duration-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">
            Attack Watcher
          </span>
        </a>

        {/* Liens centraux desktop */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-zinc-400">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="hover:text-white transition"
          >
            Fonctionnement
          </button>
          <button
            onClick={() => scrollTo('capabilities')}
            className="hover:text-white transition"
          >
            Capacités
          </button>
          <button
            onClick={() => scrollTo('console')}
            className="text-white hover:text-blue-400 transition flex items-center space-x-1.5"
          >
            <span>Console Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          </button>
          <button
            onClick={() => scrollTo('metrics')}
            className="hover:text-white transition"
          >
            Métriques
          </button>
          <button
            onClick={() => scrollTo('integration')}
            className="hover:text-white transition"
          >
            Intégration
          </button>
        </nav>

        {/* Boutons d'action à droite */}
        <div className="hidden sm:flex items-center space-x-4">
          <a
            href="https://github.com/Mohammed-ES/Attack-Watcher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-zinc-400 hover:text-white transition flex items-center space-x-1"
          >
            <span>Code Source</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              if (onNavigateToConsole) onNavigateToConsole();
              scrollTo('console');
            }}
            className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold tracking-tight transition shadow-lg shadow-white/10 active:scale-95"
          >
            Lancer l'Analyse
          </button>
        </div>

        {/* Bouton mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {mobileOpen && (
        <div className="absolute top-18 inset-x-4 max-w-6xl mx-auto bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 md:hidden">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="text-left text-sm text-zinc-300 hover:text-white"
          >
            Fonctionnement
          </button>
          <button
            onClick={() => scrollTo('capabilities')}
            className="text-left text-sm text-zinc-300 hover:text-white"
          >
            Capacités
          </button>
          <button
            onClick={() => scrollTo('console')}
            className="text-left text-sm text-blue-400 font-semibold"
          >
            Console Live (Inférence Directe)
          </button>
          <button
            onClick={() => scrollTo('metrics')}
            className="text-left text-sm text-zinc-300 hover:text-white"
          >
            Métriques & Benchmark
          </button>
          <button
            onClick={() => scrollTo('integration')}
            className="text-left text-sm text-zinc-300 hover:text-white"
          >
            Intégration
          </button>
          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (onNavigateToConsole) onNavigateToConsole();
                scrollTo('console');
              }}
              className="w-full py-2.5 rounded-full bg-white text-black text-xs font-semibold text-center"
            >
              Lancer l'Analyse
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
