import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Section Hello initiale affichant le logo .GIF animé officiel.
 * Au défilement, le composant orchestre une transition dynamique
 * fluide pour introduire la section Hero.
 */
export default function HelloSection({ onExplore }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Animations dynamiques au scroll
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.78]);
  const opacity = useTransform(scrollYProgress, [0, 0.65, 0.95], [1, 0.85, 0.2]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 80]);

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
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden px-4 pt-20"
    >
      {/* Halo lumineux d'arrière-plan bleu cobalt */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none -z-10 animate-pulse" />

      {/* Grille matricielle subtile */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Conteneur animé au scroll */}
      <motion.div
        style={{ scale, opacity, y }}
        className="flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8"
      >
        {/* Écrin du logo .GIF animé */}
        <div className="relative group cursor-pointer" onClick={scrollToHero}>
          {/* Lueur pulsée */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-[32px] blur-2xl opacity-60 group-hover:opacity-90 transition duration-500" />

          {/* Carte blanche isolée mettant en valeur l'animation du logo */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-[28px] bg-white p-4 shadow-[0_0_60px_rgba(37,99,235,0.3)] border border-white/20 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
            <img
              src="/attack-watcher-animated-logo.gif"
              alt="Attack Watcher Animated Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Titre et mention d'initialisation */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-neutral-300">ATTACK WATCHER // INITIALIZING ENGINE</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-2xl sm:text-3xl font-semibold text-white tracking-tight"
          >
            Network Threat Intelligence
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto font-light"
          >
            Système d'inspection vectorielle et détection d'attaques par déni de service distribué (DDoS).
          </motion.p>
        </div>
      </motion.div>

      {/* Invite au scroll dynamique vers le Hero Section */}
      <motion.button
        onClick={scrollToHero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center space-y-2 text-neutral-500 hover:text-white transition cursor-pointer group"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 group-hover:text-blue-400 transition">
          Faites défiler pour explorer
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="p-1.5 rounded-full border border-neutral-800 group-hover:border-blue-500 transition"
        >
          <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-blue-400 transition" />
        </motion.div>
      </motion.button>
    </section>
  );
}
