import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import HeroBeam from './HeroBeam';

export default function HeroSection({ onLaunchConsole }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative pt-44 pb-36 sm:pt-60 sm:pb-48 overflow-hidden flex flex-col items-center justify-center text-center min-h-[95vh] sm:min-h-screen bg-transparent"
    >
      {/* 1. Orgues lumineuses en U d'Aura.build */}
      <HeroBeam />

      {/* 2. Contenu de premier plan agrandi et positionné avec aisance */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-20 space-y-8">
        {/* Titre Principal Majestueux */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white leading-[1.04] drop-shadow-2xl"
        >
          Detection That Scales.
        </motion.h1>

        {/* Sous-titre épuré, centré et net, complètement dégagé des lignes lumineuses */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md"
        >
          Next-generation machine learning architecture for high-throughput network inspection,
          automated traffic scoring, and real-time DDoS mitigation.
        </motion.p>

        {/* Boutons d'action arrondis en pilule (Pill buttons) avec présence affirmée */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pt-4 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => {
              if (onLaunchConsole) onLaunchConsole();
              scrollTo('console');
            }}
            className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-black text-sm font-semibold tracking-tight transition shadow-xl shadow-blue-900/40 active:scale-95 flex items-center space-x-2"
          >
            <span>Lancer la Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 rounded-full bg-black/60 hover:bg-neutral-900 text-neutral-200 hover:text-white border border-neutral-700/80 text-sm font-medium tracking-tight transition flex items-center space-x-2 backdrop-blur-md"
          >
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>Architecture & Modèles</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
