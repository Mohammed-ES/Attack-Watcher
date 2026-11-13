import { useEffect, useRef } from 'react';

/**
 * HeroAsciiCanvas : Fond matriciel interactif ASCII réagissant à la souris.
 * Génère une grille de caractères réseau/cybersécurité visible et élégante
 * qui s'illumine et mute en temps réel sous le curseur.
 */
export default function HeroAsciiCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    const charW = 15;
    const charH = 18;
    let cols = 0;
    let rows = 0;

    // Symboles ASCII cybersécurité & flux réseau
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
            baseChar: (c + r) % 2 === 0 ? '·' : ':',
          });
        }
        grid.push(row);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      // On capture le curseur même lorsqu'il survole les textes et boutons
      if (
        e.clientY >= rect.top - 50 &&
        e.clientY <= rect.bottom + 50 &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      ) {
        mouseRef.current.targetX = e.clientX - rect.left;
        mouseRef.current.targetY = e.clientY - rect.top;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let tick = 0;

    const render = () => {
      tick++;

      // Interpolation fluide du mouvement de la souris
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.18;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.18;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
      ctx.textBaseline = 'top';

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const radius = 200; // Rayon de réaction dynamique
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

          // Réactivité à la souris
          if (distSq < radiusSq) {
            const factor = 1 - Math.sqrt(distSq) / radius;
            item.intensity = Math.max(item.intensity, factor);
            if (Math.random() < 0.15) {
              item.char = getRandomChar();
            }
          }

          // Décroissance amortie
          item.intensity *= 0.92;

          if (item.intensity > 0.05) {
            const alpha = Math.min(item.intensity, 1);

            if (item.intensity > 0.55) {
              // Brillance intense blanche / cyan
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.fillText(item.char, posX, posY);
            } else {
              // Halo bleu électrique (#38bdf8 / #3b82f6)
              ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.95})`;
              ctx.fillText(item.char, posX, posY);
            }
          } else {
            // Trame d'ambiance visible mais discrète (respiration sinusoïdale)
            const wave = Math.sin(tick * 0.02 + c * 0.15 + r * 0.1) * 0.5 + 0.5;
            if (wave > 0.85 && (c + r) % 2 === 0) {
              ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
              ctx.fillText(item.char, posX, posY);
            } else if ((c + r) % 3 === 0) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
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
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
    />
  );
}
