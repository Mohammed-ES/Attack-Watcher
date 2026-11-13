import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Conteneur avec parallaxe douce basée sur le défilement.
 */
export default function ScrollParallax({
  children,
  offset = 40,
  className = '',
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
}

