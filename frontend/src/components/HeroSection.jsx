import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import HeroBeam from './HeroBeam';
import HeroAsciiCanvas from './HeroAsciiCanvas';

export default function HeroSection({ onLaunchConsole }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative pt-36 pb-32 sm:pt-48 sm:pb-40 overflow-hidden flex flex-col items-center justify-center text-center min-h-[90vh] bg-black isolate"
    >
      {/* 1. Orgues lumineuses en U d'Aura.build */}
      <HeroBeam />

      {/* 2. Matrice ASCII interactive réagissant au mouvement de la souris */}
      <HeroAsciiCanvas />

      {/* 3. Contenu de premier plan */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10 space-y-7">
        {/* Titre Principal Majestueux (Exactement le style 'Cognition That Scales.') */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md"
        >
          Detection That Scales.
        </motion.h1>

        {/* Sous-titre épuré et centré */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow"
        >
          Next-generation machine learning architecture for high-throughput network inspection,
          automated traffic scoring, and real-time DDoS mitigation.
        </motion.p>

        {/* Boutons d'action arrondis en pilule (Pill buttons) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pt-3 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            onClick={() => {
              if (onLaunchConsole) onLaunchConsole();
              scrollTo('console');
            }}
            className="px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold tracking-tight transition shadow-xl shadow-blue-900/40 active:scale-95 flex items-center space-x-2"
          >
            <span>Lancer la Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-black/60 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-700/80 text-sm font-medium tracking-tight transition flex items-center space-x-2 backdrop-blur-md"
          >
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>Architecture & Modèles</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
