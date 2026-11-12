import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Barre de progression de défilement fixée au sommet de la fenêtre.
 * Effet néon bleu royal (#2563eb) fluide avec spring physics.
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 origin-left z-[60] pointer-events-none shadow-[0_0_12px_rgba(37,99,235,0.7)]"
    />
  );
}
