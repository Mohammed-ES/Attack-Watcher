import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ onNavigateToConsole }) {
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        // Apparaît dès que le Hero section entre dans le viewport
        const inHeroOrBelow = rect.top <= window.innerHeight * 0.75;
        setVisible(inHeroOrBelow);
        setScrolled(rect.top <= 80);
      } else {
        setVisible(window.scrollY > 200);
        setScrolled(window.scrollY > 250);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12 pointer-events-none'
        }`}
    >
      <div
        className={`w-full max-w-6xl rounded-full px-5 py-3 flex items-center justify-between transition-all duration-300 ${scrolled
            ? 'bg-black/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/90'
            : 'bg-black/50 backdrop-blur-md border border-white/5'
          }`}
      >
        {/* Logo officiel Attack Watcher */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('hero');
          }}
          className="flex items-center space-x-3 text-white group"
        >
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105">
            <img
              src="/color-icon.webp"
              alt="Attack Watcher Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center space-x-1.5">
            <span>Attack Watcher</span>
          </span>
        </a>

        {/* Liens centraux desktop */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-neutral-400">
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
            Pipeline & Modèles
          </button>
          <button
            onClick={() => scrollTo('console')}
            className="text-white hover:text-blue-400 transition flex items-center space-x-1.5"
          >
            <span>Console Live</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="hover:text-white transition"
          >
            FAQ
          </button>
        </nav>

        {/* Boutons d'action à droite */}
        <div className="hidden sm:flex items-center space-x-4">
          <a
            href="https://github.com/Mohammed-ES/Attack-Watcher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-neutral-400 hover:text-white transition flex items-center space-x-1"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => {
              if (onNavigateToConsole) onNavigateToConsole();
              scrollTo('console');
            }}
            className="px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold tracking-tight transition shadow-lg shadow-white/10 active:scale-95"
          >
            Lancer l'Analyse
          </button>
        </div>

        {/* Bouton mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {mobileOpen && (
        <div className="absolute top-18 inset-x-4 max-w-6xl mx-auto bg-neutral-950/95 border border-neutral-800 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 md:hidden">
          <button
            onClick={() => scrollTo('how-it-works')}
            className="text-left text-sm text-neutral-300 hover:text-white"
          >
            Fonctionnement
          </button>
          <button
            onClick={() => scrollTo('capabilities')}
            className="text-left text-sm text-neutral-300 hover:text-white"
          >
            Pipeline & Modèles
          </button>
          <button
            onClick={() => scrollTo('console')}
            className="text-left text-sm text-blue-400 font-semibold"
          >
            Console Live (Inférence Directe)
          </button>
          <button
            onClick={() => scrollTo('faq')}
            className="text-left text-sm text-neutral-300 hover:text-white"
          >
            Questions / FAQ
          </button>
          <div className="pt-2 border-t border-neutral-800 flex flex-col space-y-3">
            <a
              href="https://github.com/Mohammed-ES/Attack-Watcher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1"
            >
              <span>Dépôt GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
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
