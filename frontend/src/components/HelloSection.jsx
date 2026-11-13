import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * HelloSection : Première section visible à l'ouverture du site.
 * Reprend le cadre épuré avec les 3 pastilles de contrôle,
 * où le .GIF animé prend tout l'espace disponible de manière majestueuse.
 * Au défilement, elle transitionne avec fluidité vers la HeroSection ("Detection That Scales.").
 */
export default function HelloSection({ onExplore }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transition dynamique au scroll vers le Hero
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.95, 0.25]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const scrollToHero = () => {
    if (onExplore) {
      onExplore();
      return;
    }
    const el = document.getElementById('hero');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden px-4 sm:px-6 pt-24 pb-12"
    >
      {/* Halo d'ambiance bleuté diffus */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none -z-10 animate-pulse" />

      {/* Cadre inspiré de la capture : le .GIF prend tout l'espace complet */}
      <motion.div
        style={{ scale, opacity, y }}
        className="w-full max-w-4xl mx-auto flex flex-col items-center"
      >
        <div className="w-full rounded-3xl bg-[#0c0c0e] border border-neutral-800/90 shadow-[0_0_80px_rgba(37,99,235,0.22)] overflow-hidden flex flex-col backdrop-blur-2xl">
          {/* Barre supérieure avec les 3 pastilles colorées façon fenêtre d'application */}
          <div className="flex items-center px-5 py-3.5 border-b border-neutral-800/80 bg-black/60">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="ml-4 font-mono text-[11px] text-neutral-500 tracking-wider">
              attack-watcher // threat-intelligence-engine
            </div>
          </div>

          {/* Intérieur : Le GIF animé prend tout l'espace complet */}
          <div className="relative w-full h-[360px] sm:h-[460px] md:h-[540px] bg-white flex items-center justify-center overflow-hidden p-6 sm:p-12">
            <img
              src="/attack-watcher-animated-logo.gif"
              alt="Attack Watcher Animated Logo"
              className="w-full h-full object-contain select-none"
            />
          </div>
        </div>

        {/* Invite au défilement vers le Hero Section ("Detection That Scales.") */}
        <button
          onClick={scrollToHero}
          className="mt-8 flex flex-col items-center space-y-2 text-neutral-500 hover:text-white transition cursor-pointer group"
        >
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 group-hover:text-blue-400 transition">
            Faites défiler pour explorer
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="p-1.5 rounded-full border border-neutral-800 group-hover:border-blue-500 transition"
          >
            <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-blue-400 transition" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}
