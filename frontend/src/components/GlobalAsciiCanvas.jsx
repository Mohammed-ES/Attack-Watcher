import { useEffect, useRef } from 'react';

/**
 * GlobalAsciiCanvas : Matrice ASCII interactive au passage de la souris
 * appliquée sur l'ensemble du site, du Hero jusqu'au Footer.
 * Calibrée avec une luminosité ambiante douce et amortie pour ne jamais
 * gêner la lisibilité du texte et préserver le contraste des sélections.
 */
export default function GlobalAsciiCanvas() {
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
    const charW = 16;
    const charH = 20;
    let cols = 0;
    let rows = 0;

    // Symboles ASCII cybersécurité, flux réseau et mathématiques
    const CHAR_SET = '01#+-/\\:.~*<>[]{}@$%&!?';
    const getRandomChar = () => CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];

    let grid = [];

    const updateDimensions = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const newWidth = parent.clientWidth;
      const newHeight = parent.clientHeight;

      if (newWidth === width && newHeight === height) return;

      width = newWidth;
      height = newHeight;
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

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50) {
        mouseRef.current.targetX = x;
        mouseRef.current.targetY = y;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      // Interpolation douce du curseur
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.18;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.18;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
      ctx.textBaseline = 'top';

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const radius = 200; // Rayon interactif de la souris
      const radiusSq = radius * radius;

      // Détection de sélection de texte active pour atténuer le fond et garantir une lisibilité absolue
      const hasTextSelection =
        typeof window !== 'undefined' &&
        window.getSelection &&
        window.getSelection().toString().trim().length > 0;
      const selectionFactor = hasTextSelection ? 0.2 : 1;

      // Optimisation viewport : calcul des lignes visibles à l'écran
      const scrollY = window.scrollY;
      const viewHeight = window.innerHeight;
      const canvasTop = canvas.getBoundingClientRect().top + scrollY;
      const visibleStartRow = Math.max(0, Math.floor((scrollY - canvasTop - 100) / charH));
      const visibleEndRow = Math.min(rows, Math.ceil((scrollY - canvasTop + viewHeight + 100) / charH));

      for (let r = visibleStartRow; r < visibleEndRow; r++) {
        for (let c = 0; c < cols; c++) {
          const item = grid[r]?.[c];
          if (!item) continue;

          const posX = c * charW;
          const posY = r * charH;

          const dx = posX + charW / 2 - mouseX;
          const dy = posY + charH / 2 - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq) {
            const factor = 1 - Math.sqrt(distSq) / radius;
            item.intensity = Math.max(item.intensity, factor);
            if (Math.random() < 0.12) {
              item.char = getRandomChar();
            }
          }

          // Décroissance amortie fluide
          item.intensity *= 0.91;

          if (item.intensity > 0.04) {
            // Intensité plafonnée à une valeur douce pour ne jamais éblouir le texte
            const alpha = Math.min(item.intensity * 0.32, 0.32) * selectionFactor;

            if (item.intensity > 0.5) {
              // Reflet bleuté doux sous le curseur
              ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
              ctx.fillText(item.char, posX, posY);
            } else {
              // Halo bleu cobalt discret (#2563eb)
              ctx.fillStyle = `rgba(37, 99, 235, ${alpha * 0.85})`;
              ctx.fillText(item.char, posX, posY);
            }
          } else if ((c + r) % 6 === 0) {
            // Trame d'ambiance ultra-légère (zéro calcul trigonométrique lourd par cellule)
            ctx.fillStyle = `rgba(255, 255, 255, ${0.025 * selectionFactor})`;
            ctx.fillText(item.baseChar, posX, posY);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}
