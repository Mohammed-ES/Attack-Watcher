import { useEffect, useRef } from 'react';

/**
 * HeroAsciiCanvas : Fond matriciel interactif ASCII réagissant à la souris.
 * Génère une grille de caractères réseau/cybersécurité qui s'illuminent,
 * ondulent et mutent dynamiquement au passage du curseur.
 */
export default function HeroAsciiCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    const charW = 14;
    const charH = 18;
    let cols = 0;
    let rows = 0;

    // Caractères ASCII cybersécurité & réseau
    const CHAR_SET = '01#+-/\\:.~*<>[]{}@$%&!?';
    const getRandomChar = () => CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];

    let grid = [];

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;

      cols = Math.ceil(width / charW);
      rows = Math.ceil(height / charH);

      grid = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push({
            char: getRandomChar(),
            intensity: 0,
            baseChar: (c + r) % 2 === 0 ? '.' : ' ',
          });
        }
        grid.push(row);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let tick = 0;

    const render = () => {
      tick++;

      // Interpolation douce du curseur
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
      ctx.textBaseline = 'top';

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const radius = 170; // Rayon d'interaction autour de la souris
      const radiusSq = radius * radius;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const item = grid[r]?.[c];
          if (!item) continue;

          const posX = c * charW;
          const posY = r * charH;

          const dx = posX + charW / 2 - mouseX;
          const dy = posY + charH / 2 - mouseY;
          const distSq = dx * dx + dy * dy;

          // Influence de la souris
          if (distSq < radiusSq) {
            const factor = 1 - Math.sqrt(distSq) / radius;
            item.intensity = Math.max(item.intensity, factor);
            // Mutation aléatoire des caractères au passage de la souris
            if (Math.random() < 0.12) {
              item.char = getRandomChar();
            }
          }

          // Décroissance douce
          item.intensity *= 0.94;

          // Rendu selon l'intensité
          if (item.intensity > 0.05) {
            const alpha = Math.min(item.intensity, 0.85);

            if (item.intensity > 0.6) {
              // Coeur brillant blanc/cyan
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.fillText(item.char, posX, posY);
            } else {
              // Halo bleu royal (#2563eb / #38bdf8)
              ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.9})`;
              ctx.fillText(item.char, posX, posY);
            }
          } else {
            // Fond très discret avec onde périodique légère
            const wave = Math.sin(tick * 0.02 + c * 0.1 + r * 0.08) * 0.5 + 0.5;
            if (wave > 0.88 && (c + r) % 3 === 0) {
              ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
              ctx.fillText(item.baseChar, posX, posY);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-5"
    />
  );
}
