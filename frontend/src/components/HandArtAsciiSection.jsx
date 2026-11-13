import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal, Crosshair, Grid, Sparkles } from 'lucide-react';
import { ScrollReveal } from '../animations';

/**
 * HandArtAsciiSection : Reconstitution fidèle du chef-d'œuvre "HandArt" de 21st.dev.
 * Reproduction de l'effet raster Canvas2D sur "The Creation of Adam" :
 * - Mode Classique : Rendu mosaïque raster avec micro-lignes horizontales gravées et grille (exactement comme le visuel 21st.dev).
 * - Mode Scanner Tactique : Lentille holographique interactive révélant le code binaire/hexadécimal (#00ff66) au survol de la souris.
 * - Mode Cyber Hexdump : Matrice intégrale de glyphes hexadécimaux avec scintillement CRT, scanlines, bloom et aberration chromatique.
 */
export default function HandArtAsciiSection() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Modes : 'classic' (visuel 21st.dev HandArt exact), 'scanner' (lentille interactive), 'hexdump' (recette cyber verte)
  const [mode, setMode] = useState('classic');
  const [cellSize, setCellSize] = useState(10); // 8, 10, 12, 14
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Chargement de l'image source "The Creation of Adam" (HandArt)
  useEffect(() => {
    const img = new Image();
    img.src = '/handart-source.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.warn('Impossible de charger /handart-source.jpg, utilisation du fallback.');
      setIsLoaded(true);
    };
  }, []);

  // Gestion des mouvements de souris pour la lentille scanner
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseRef.current = { x, y, active: true };
    setMousePos({ x: Math.round(x), y: Math.round(y) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000, active: false };
  }, []);

  // Boucle de rendu Canvas2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let frame = 0;

    const HEX_GLYPHS = ['0', '1', 'A', 'F', '3', '7', 'C', 'E', 'x', '#', ':', '.'];

    const render = () => {
      frame++;
      const img = imageRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (!img || !img.complete) {
        // En attente du chargement
        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#71717a';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Initialisation du pipeline HandArt Canvas2D...', width / 2, height / 2);
        animId = requestAnimationFrame(render);
        return;
      }

      // Échantillonnage de l'image source dans un canvas hors-écran
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, width, height);
      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const size = cellSize;
      const cols = Math.floor(width / size);
      const rows = Math.floor(height / size);

      const mouse = mouseRef.current;
      const lensRadius = 150;

      // 1. Fond du canevas
      if (mode === 'hexdump') {
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Fond légèrement chaud/marbre pour sublimer le style HandArt
        ctx.fillStyle = '#b3aba0';
        ctx.fillRect(0, 0, width, height);
      }

      // Buffer pour l'effet de bloom
      const bloomCanvas = document.createElement('canvas');
      bloomCanvas.width = width;
      bloomCanvas.height = height;
      const bCtx = bloomCanvas.getContext('2d');

      ctx.font = `bold ${Math.floor(size * 0.9)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (bCtx) {
        bCtx.font = ctx.font;
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
      }

      // Scintillement d'animation flicker
      const flickerFactor = Math.sin(frame * 0.2) * 0.12 + (Math.random() < 0.05 ? 0.25 : 0);

      // 2. Échantillonnage par cellule
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * size;
          const py = r * size;
          const centerX = px + Math.floor(size / 2);
          const centerY = py + Math.floor(size / 2);

          const idx = (centerY * width + centerX) * 4;
          let red = data[idx] || 0;
          let green = data[idx + 1] || 0;
          let blue = data[idx + 2] || 0;

          // Luminance normalisée (0 à 1)
          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

          // Ajustement de contraste (115% de la recette 21st.dev)
          const contrast = 1.15;
          lum = (lum - 0.5) * contrast + 0.5;
          lum = Math.max(0, Math.min(1, lum));

          // Calcul de la distance à la souris pour le mode scanner
          const distToMouse = Math.hypot(centerX - mouse.x, centerY - mouse.y);
          const inLens = mode === 'scanner' && mouse.active && distToMouse < lensRadius;

          if (mode === 'classic' || (mode === 'scanner' && !inLens)) {
            // ==========================================
            // RENDU "HANDART" CLASSIQUE (STYLE IMAGE 1)
            // ==========================================
            // Remplissage de la cellule avec la teinte moyenne échantillonnée
            ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            ctx.fillRect(px, py, size, size);

            // Grille fine de délimitation de la cellule
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(px, py, size, size);

            // Micro-lignes horizontales gravées caractéristiques du HandArt
            // Plus la zone est sombre, plus le trait est épais et marqué
            const darkWeight = Math.max(0, 1 - lum);
            if (darkWeight > 0.12) {
              const lineThickness = Math.max(0.7, darkWeight * 2.2);
              ctx.fillStyle = `rgba(35, 25, 18, ${Math.min(0.85, darkWeight * 1.1)})`;
              ctx.fillRect(px, py + Math.floor(size / 2) - lineThickness / 2, size, lineThickness);
            }
          } else {
            // ==========================================
            // RENDU CYBER HEXDUMP (#00ff66 MATRIX FLICKER)
            // ==========================================
            const animatedLum = Math.max(0, Math.min(1, lum + flickerFactor * 0.2));
            const glyphIdx = Math.floor(animatedLum * (HEX_GLYPHS.length - 1));
            const glyph = HEX_GLYPHS[glyphIdx] || '0';

            // Teinte Matrix #00ff66 avec opacité 45%
            const tintR = 0;
            const tintG = 255;
            const tintB = 102;
            const tintAlpha = 0.45;

            const outR = Math.floor(red * (1 - tintAlpha) + tintR * tintAlpha * animatedLum);
            const outG = Math.floor(green * (1 - tintAlpha) + tintG * tintAlpha * animatedLum);
            const outB = Math.floor(blue * (1 - tintAlpha) + tintB * tintAlpha * animatedLum);

            if (inLens) {
              // Fond sombre dans la lentille scanner
              ctx.fillStyle = 'rgba(2, 6, 12, 0.92)';
              ctx.fillRect(px, py, size, size);
            }

            const alpha = inLens ? 1 : Math.max(0.2, animatedLum);
            ctx.fillStyle = `rgba(${outR}, ${outG}, ${outB}, ${alpha})`;
            ctx.fillText(glyph, centerX, centerY);

            // Accumulation bloom
            if (bCtx && animatedLum > 0.6) {
              bCtx.fillStyle = `rgba(${outR}, ${outG}, ${outB}, 0.85)`;
              bCtx.fillText(glyph, centerX, centerY);
            }
          }
        }
      }

      // 3. Post-effets visuels de la recette 21st.dev
      // 3.1 Bloom (lueur diffuse) en mode hexdump / scanner
      if (bCtx && (mode === 'hexdump' || mode === 'scanner')) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = 'blur(6px)';
        ctx.drawImage(bloomCanvas, 0, 0);
        ctx.restore();
      }

      // 3.2 Aberration Chromatique intermittente (chromatic 40)
      if (mode === 'hexdump' && Math.random() < 0.25) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(canvas, -2, 0, width, height);
        ctx.drawImage(canvas, 2, 0, width, height);
        ctx.restore();
      }

      // 3.3 ScanLines CRT fines horizontales (scanLines 28)
      ctx.fillStyle = mode === 'hexdump' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      // 3.4 Vignette radiale sombre (vignette 38)
      const vGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.35,
        width / 2,
        height / 2,
        width * 0.72
      );
      vGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vGrad.addColorStop(1, mode === 'hexdump' ? 'rgba(2, 4, 8, 0.75)' : 'rgba(20, 15, 10, 0.45)');
      ctx.fillStyle = vGrad;
      ctx.fillRect(0, 0, width, height);

      // 3.5 Overlay visuel de la lentille scanner
      if (mode === 'scanner' && mouse.active) {
        ctx.save();
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, lensRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Réticule central
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouse.x - 14, mouse.y);
        ctx.lineTo(mouse.x + 14, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 14);
        ctx.lineTo(mouse.x, mouse.y + 14);
        ctx.stroke();

        // Données télémétriques de la lentille
        ctx.fillStyle = '#00ff66';
        ctx.font = '10px monospace';
        ctx.fillText(`TARGET: [${mouse.x}, ${mouse.y}]`, mouse.x + 18, mouse.y - 18);
        ctx.fillText(`RASTER: ${cellSize}px // FLICKER`, mouse.x + 18, mouse.y - 6);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, cellSize, isLoaded]);

  return (
    <section
      id="ascii-art"
      className="py-24 sm:py-36 bg-black border-t border-[#1a1a1e] relative overflow-hidden"
    >
      {/* Halos d'ambiance bleus et émeraude discrets */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête élégant aligné avec le design system Aura.build */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-emerald-400 border border-[#222228]">
              <Terminal className="w-3.5 h-3.5" />
              <span>21st.dev // HandArt Canvas2D Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              The Touch of Intelligence
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Reconstitution fidèle du chef-d'œuvre "HandArt" de 21st.dev. Échantillonnage matriciel en temps réel,
              micro-lignes raster gravées et décodage vectoriel au curseur.
            </p>
          </div>
        </ScrollReveal>

        {/* Barre de commandes et de modes intégrée au style du site */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-2">
            {/* Sélecteur de mode de rendu */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-[#0c0c0e] border border-[#1a1a1e] shadow-xl">
              <button
                onClick={() => setMode('classic')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center space-x-2 ${
                  mode === 'classic'
                    ? 'bg-neutral-800 text-white font-semibold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                <span>HandArt Classique</span>
              </button>

              <button
                onClick={() => setMode('scanner')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center space-x-2 ${
                  mode === 'scanner'
                    ? 'bg-emerald-600 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
                <span>Scanner Interactif</span>
              </button>

              <button
                onClick={() => setMode('hexdump')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center space-x-2 ${
                  mode === 'hexdump'
                    ? 'bg-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-blue-300" />
                <span>Matrice Hexdump</span>
              </button>
            </div>

            {/* Ajustement fin de la résolution matricielle */}
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400 bg-[#0c0c0e] border border-[#1a1a1e] px-3.5 py-1.5 rounded-2xl">
              <span className="text-neutral-500">Raster Cell:</span>
              {[8, 10, 12, 14].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setCellSize(sz)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    cellSize === sz
                      ? 'bg-white text-black font-bold'
                      : 'hover:text-white text-neutral-400'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Le Grand Écran Canvas2D Panoramique (Style Visuel Image 1) */}
        <ScrollReveal direction="up" delay={0.15}>
          <div
            ref={containerRef}
            className="rounded-3xl bg-[#0c0c0e] border border-[#1a1a1e] p-2.5 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden relative group hover:border-[#26262b] transition-all duration-300"
          >
            {/* Liseré supérieur avec boutons CRT façon vitrine d'art */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/80 rounded-t-2xl border-b border-[#1a1a1e] text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-neutral-400 text-[11px]">
                  21st.dev // HandArt (Creation of Adam) — {cellSize}px raster grid
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
                <span className="hidden sm:inline">Cursor: [{mousePos.x}, {mousePos.y}]</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>60 FPS</span>
                </span>
              </div>
            </div>

            {/* Toile Canvas2D Haute Définition */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[1024/538] bg-black rounded-b-2xl overflow-hidden cursor-crosshair">
              <canvas
                ref={canvasRef}
                width={1024}
                height={538}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full object-cover select-none"
              />

              {/* Réticule d'angle technologique */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/20 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/20 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/20 pointer-events-none" />
            </div>

            {/* Barre de télémétrie inférieure */}
            <div className="px-4 py-2.5 bg-black/90 rounded-b-2xl border-t border-[#1a1a1e] flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400">
              <div className="flex items-center space-x-4">
                <span>Subject: Michelangelo "The Creation of Adam"</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Mode: {mode.toUpperCase()}</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Coverage: 93%</span>
              </div>
              <div className="text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Pixel Mosaic & Hex Shaders Active</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
