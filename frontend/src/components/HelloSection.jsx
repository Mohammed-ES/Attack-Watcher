import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * HelloSection : Première section immersive plein écran.
 * Le logo GIF animé officiel prend tout l'espace de la section, sans cadre ni barre supérieure.
 * La barre de navigation est masquée durant cette section et n'apparaît que lors du défilement vers le Hero.
 */
export default function HelloSection({ onExplore }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transition dynamique au scroll vers le Hero
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.9, 0.1]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

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
      className="relative w-full min-h-screen h-screen flex flex-col items-center justify-center bg-white overflow-hidden px-4 sm:px-8"
    >
      {/* Conteneur fluide du GIF animé prenant la section complète sans encadrement */}
      <motion.div
        style={{ scale, opacity, y }}
        className="w-full h-full flex flex-col items-center justify-center max-w-5xl mx-auto py-8"
      >
        <div className="w-full flex-1 flex items-center justify-center max-h-[82vh]">
          <img
            src="/attack-watcher-animated-logo.gif"
            alt="Attack Watcher Animated Logo"
            className="w-full h-full max-h-[75vh] object-contain select-none"
          />
        </div>
      </motion.div>

      {/* Dégradé doux de transition vers le fond noir du Hero */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black pointer-events-none" />

      {/* Bouton d'invitation au défilement vers le Hero Section */}
      <button
        onClick={scrollToHero}
        className="absolute bottom-8 z-20 flex flex-col items-center space-y-2 text-neutral-400 hover:text-white transition cursor-pointer group"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-blue-400 transition">
          Faites défiler pour explorer
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="p-1.5 rounded-full border border-neutral-700/80 group-hover:border-blue-500 bg-black/40 backdrop-blur transition"
        >
          <ChevronDown className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 transition" />
        </motion.div>
      </button>
    </section>
  );
}
