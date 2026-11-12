import { motion } from 'framer-motion';

/**
 * Composant de révélation fluide au scroll (Framer Motion).
 * Anime l'apparition des sections avec opacité, translation et léger flou.
 */
export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 32,
  threshold = 0.15,
  once = true,
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'zoom':
        return { scale: 0.94, y: distance / 2, x: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initial = {
    opacity: 0,
    filter: 'blur(6px)',
    ...getInitialPosition(),
  };

  const animate = {
    opacity: 1,
    filter: 'blur(0px)',
    x: 0,
    y: 0,
    scale: 1,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Courbe cubique fluide façon Apple / Aura
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
