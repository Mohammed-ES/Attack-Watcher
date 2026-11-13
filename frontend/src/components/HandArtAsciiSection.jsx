import { useEffect, useRef, useState } from 'react';
import { Terminal, Sliders, RefreshCw, Zap } from 'lucide-react';
import { ScrollReveal } from '../animations';

/**
 * HandArtAsciiSection : Implémentation complète du pipeline "HandArt" ASCII de 21st.dev (Canvas2D).
 * Rendu matriciel haute fidélité avec échantillonnage par cellule, ajustements colorimétriques,
 * teinte (#00ff66), post-effets (scanlines, vignette, bloom, aberration chromatique, glitch, grain)
 * et animation flicker en temps réel.
 */
export default function HandArtAsciiSection() {
  const canvasRef = useRef(null);
  const sourceCanvasRef = useRef(null);

  // Paramètres par défaut issus de la recette JSON 21st.dev
  const [params, setParams] = useState({
    renderMode: 'hexdump', // hexdump, matrix, braille, dots, characters, dither
    cellSize: 12,
    coverage: 93,
    contrast: 115,
    edgeEmphasis: 40,
    tint: '#00ff66',
    tintOpacity: 45,
    scanLines: 28,
    vignette: 38,
    chromatic: 40,
    bloom: 60,
    filmGrain: 40,
    glitch: 20,
    animStyle: 'flicker',
    animated: true,
  });

  const [activeSubject, setActiveSubject] = useState('sentinel'); // 'sentinel' (cyber security shield/human) ou 'matrix-core'

  // Générateur procédural du sujet source (haute définition, fort contraste, zéro dépendance réseau)
  useEffect(() => {
    const sc = document.createElement('canvas');
    sc.width = 680;
    sc.height = 420;
    const sctx = sc.getContext('2d');
    if (!sctx) return;

    const w = sc.width;
    const h = sc.height;

    // Fond sombre texturé
    sctx.fillStyle = '#05070f';
    sctx.fillRect(0, 0, w, h);

    if (activeSubject === 'sentinel') {
      // Sujet Cyber Sentinel : Silhouette cybernétique avec bouclier réseau et lueurs
      const grad = sctx.createRadialGradient(w / 2, h / 2 - 20, 20, w / 2, h / 2, 280);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(0.4, '#0f172a');
      grad.addColorStop(1, '#020617');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, w, h);

      // Bouclier géométrique central haute définition
      sctx.save();
      sctx.translate(w / 2, h / 2 - 10);

      // Halo externe du bouclier
      sctx.beginPath();
      sctx.moveTo(0, -110);
      sctx.lineTo(85, -55);
      sctx.lineTo(85, 45);
      sctx.lineTo(0, 115);
      sctx.lineTo(-85, 45);
      sctx.lineTo(-85, -55);
      sctx.closePath();
      sctx.fillStyle = '#1d4ed8';
      sctx.fill();

      // Coeur du bouclier (fort contraste blanc / cyan)
      sctx.beginPath();
      sctx.moveTo(0, -90);
      sctx.lineTo(68, -45);
      sctx.lineTo(68, 35);
      sctx.lineTo(0, 95);
      sctx.lineTo(-68, 35);
      sctx.lineTo(-68, -45);
      sctx.closePath();
      sctx.fillStyle = '#ffffff';
      sctx.fill();

      // Symbole d'attaque interceptée au centre
      sctx.beginPath();
      sctx.arc(0, 0, 38, 0, Math.PI * 2);
      sctx.fillStyle = '#0a0f1d';
      sctx.fill();

      // Croix de mire tactique
      sctx.strokeStyle = '#38bdf8';
      sctx.lineWidth = 5;
      sctx.beginPath();
      sctx.moveTo(-25, 0);
      sctx.lineTo(25, 0);
      sctx.moveTo(0, -25);
      sctx.lineTo(0, 25);
      sctx.stroke();

      sctx.restore();

      // Topologie de réseau (noeuds et connexions autour)
      sctx.strokeStyle = '#60a5fa';
      sctx.lineWidth = 2;
      const nodes = [
        [w * 0.18, h * 0.25],
        [w * 0.28, h * 0.75],
        [w * 0.82, h * 0.25],
        [w * 0.72, h * 0.75],
        [w * 0.15, h * 0.55],
        [w * 0.85, h * 0.55],
      ];
      nodes.forEach(([nx, ny]) => {
        sctx.beginPath();
        sctx.arc(nx, ny, 12, 0, Math.PI * 2);
        sctx.fillStyle = '#38bdf8';
        sctx.fill();
        sctx.stroke();

        sctx.beginPath();
        sctx.moveTo(nx, ny);
        sctx.lineTo(w / 2, h / 2);
        sctx.stroke();
      });
    } else {
      // Sujet Matrix Core : Flux binaire et processeur central
      const grad = sctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#064e3b');
      grad.addColorStop(1, '#020617');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, w, h);

      sctx.fillStyle = '#ffffff';
      sctx.font = 'bold 120px monospace';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText('CIC-2017', w / 2, h / 2 - 20);

      sctx.fillStyle = '#34d399';
      sctx.font = '24px monospace';
      sctx.fillText('01010011 01000101 01000011', w / 2, h / 2 + 65);
    }

    sourceCanvasRef.current = sc;
  }, [activeSubject]);

  // Boucle de rendu Canvas2D conforme à la recette 21st.dev
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let frame = 0;

    // Palette hex / binary pour hexdump
    const HEX_GLYPHS = ['0', '1', 'A', 'F', '3', '7', 'C', 'E', 'x', '#', ':', '.'];
    const BRAILLE_GLYPHS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏', '⣿'];
    const MATRIX_GLYPHS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Z', 'X', 'Y', '$'];

    const render = () => {
      frame++;
      const source = sourceCanvasRef.current;
      if (!source) {
        animId = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      const cellSize = Math.max(6, params.cellSize);

      // Étape 1 : Fond selon bgMode (ici solide noir #040406)
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, width, height);

      // Récupération de l'image source à la taille cible
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;
      offCtx.drawImage(source, 0, 0, width, height);

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);

      // Préparation du buffer bloom si activé
      const bloomCanvas = document.createElement('canvas');
      bloomCanvas.width = width;
      bloomCanvas.height = height;
      const bCtx = bloomCanvas.getContext('2d');

      ctx.font = `${Math.floor(cellSize * 0.95)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (bCtx) {
        bCtx.font = ctx.font;
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
      }

      // Facteur de scintillement d'animation flicker
      const flickerFactor = params.animated
        ? Math.sin(frame * 0.25) * 0.15 + (Math.random() < 0.08 ? 0.3 : 0)
        : 0;

      // Étape 2 & 3 : Découpage en cellules et échantillonnage de la luminance
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * cellSize + Math.floor(cellSize / 2);
          const py = r * cellSize + Math.floor(cellSize / 2);

          const idx = (py * width + px) * 4;
          let red = data[idx] || 0;
          let green = data[idx + 1] || 0;
          let blue = data[idx + 2] || 0;

          // Luminance standard
          let lum = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

          // Étape 4 : Ajustement de contraste (115)
          const contrast = params.contrast / 100;
          lum = (lum - 0.5) * contrast + 0.5;
          lum = Math.max(0, Math.min(1, lum));

          // Filtre de couverture (coverage 93%)
          const cellHash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          const pseudoRand = cellHash - Math.floor(cellHash);
          if (pseudoRand > params.coverage / 100) continue;

          // Détection de contour (edgeEmphasis 40)
          let isEdge = false;
          if (params.edgeEmphasis > 0 && c > 0 && r > 0 && c < cols - 1 && r < rows - 1) {
            const rightIdx = (py * width + (px + cellSize)) * 4;
            const downIdx = ((py + cellSize) * width + px) * 4;
            const rLum = (0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2]) / 255;
            const dLum = (0.299 * data[downIdx] + 0.587 * data[downIdx + 1] + 0.114 * data[downIdx + 2]) / 255;
            const diff = Math.abs(lum - rLum) + Math.abs(lum - dLum);
            if (diff > (100 - params.edgeEmphasis) / 100) {
              isEdge = true;
              lum = Math.min(1, lum + 0.25);
            }
          }

          // Modulation par animation flicker
          let animatedLum = Math.max(0, Math.min(1, lum + flickerFactor * (pseudoRand > 0.5 ? 0.2 : -0.2)));

          // Sélection du glyphe selon renderMode
          let glyph = '0';
          if (params.renderMode === 'hexdump') {
            const glyphIdx = Math.floor(animatedLum * (HEX_GLYPHS.length - 1));
            glyph = HEX_GLYPHS[glyphIdx] || '0';
          } else if (params.renderMode === 'matrix') {
            const glyphIdx = (frame + c * 3 + r * 7) % MATRIX_GLYPHS.length;
            glyph = MATRIX_GLYPHS[glyphIdx];
          } else if (params.renderMode === 'braille') {
            const glyphIdx = Math.floor(animatedLum * (BRAILLE_GLYPHS.length - 1));
            glyph = BRAILLE_GLYPHS[glyphIdx];
          } else {
            // mode characters
            const set = ' .:-=+*#%@';
            const glyphIdx = Math.floor(animatedLum * (set.length - 1));
            glyph = set[glyphIdx];
          }

          // Application de la teinte #00ff66 à tintOpacity (45%)
          // Couleur de base teintée
          const tintR = 0;
          const tintG = 255;
          const tintB = 102;
          const tintAlpha = params.tintOpacity / 100;

          const outR = Math.floor(red * (1 - tintAlpha) + tintR * tintAlpha * animatedLum);
          const outG = Math.floor(green * (1 - tintAlpha) + tintG * tintAlpha * animatedLum);
          const outB = Math.floor(blue * (1 - tintAlpha) + tintB * tintAlpha * animatedLum);

          // Rendu du glyphe
          const alpha = isEdge ? 1 : Math.max(0.18, animatedLum);
          ctx.fillStyle = `rgba(${outR}, ${outG}, ${outB}, ${alpha})`;
          ctx.fillText(glyph, px, py);

          // Accumulation bloom pour les zones lumineuses
          if (bCtx && params.bloom > 0 && animatedLum > 0.65) {
            bCtx.fillStyle = `rgba(${outR}, ${outG}, ${outB}, 0.8)`;
            bCtx.fillText(glyph, px, py);
          }
        }
      }

      // Étape 5 : Post-effets (pfx)
      // 5.1 Bloom (lueur diffuse)
      if (bCtx && params.bloom > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = `blur(${Math.floor(params.bloom * 0.12)}px)`;
        ctx.drawImage(bloomCanvas, 0, 0);
        ctx.restore();
      }

      // 5.2 Aberration Chromatique (chromatic 40)
      if (params.chromatic > 0 && Math.random() < 0.35) {
        const offset = (params.chromatic / 100) * 4;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(canvas, -offset, 0, width, height);
        ctx.drawImage(canvas, offset, 0, width, height);
        ctx.restore();
      }

      // 5.3 ScanLines CRT (scanLines 28)
      if (params.scanLines > 0) {
        const lineAlpha = (params.scanLines / 100) * 0.35;
        ctx.fillStyle = `rgba(0, 0, 0, ${lineAlpha})`;
        for (let y = 0; y < height; y += 3) {
          ctx.fillRect(0, y, width, 1.2);
        }
      }

      // 5.4 Glitch horizontal intermittent (glitch 20)
      if (params.glitch > 0 && Math.random() < (params.glitch / 100) * 0.25) {
        const sliceY = Math.random() * height;
        const sliceH = Math.random() * 25 + 5;
        const sliceShift = (Math.random() - 0.5) * 16;
        ctx.drawImage(canvas, 0, sliceY, width, sliceH, sliceShift, sliceY, width, sliceH);
      }

      // 5.5 Grain de film argentique (filmGrain 40)
      if (params.filmGrain > 0) {
        const grainAlpha = (params.filmGrain / 100) * 0.14;
        ctx.fillStyle = `rgba(255, 255, 255, ${grainAlpha})`;
        for (let i = 0; i < 400; i++) {
          const gx = Math.random() * width;
          const gy = Math.random() * height;
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // 5.6 Vignette radiale sombre (vignette 38)
      if (params.vignette > 0) {
        const vGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          width * 0.3,
          width / 2,
          height / 2,
          width * 0.72
        );
        const vigIntensity = (params.vignette / 100) * 0.85;
        vGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vGrad.addColorStop(1, `rgba(2, 4, 8, ${vigIntensity})`);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [params, activeSubject]);

  return (
    <section
      id="ascii-art"
      className="py-24 sm:py-36 bg-black/80 border-t border-[#1a1a1e] relative backdrop-blur-sm overflow-hidden"
    >
      {/* Halo d'ambiance vert matrix / cyan diffus */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête de section */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-emerald-400 border border-[#222228]">
              <Terminal className="w-3.5 h-3.5" />
              <span>21st.dev Canvas2D Recipe</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              HandArt ASCII Raster Engine
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Reconstitution fidèle du pipeline de rendu ASCII-art de 21st.dev avec décomposition raster,
              échantillonnage par cellule, teinte matrix, post-effets CRT et animation flicker dynamique.
            </p>
          </div>
        </ScrollReveal>

        {/* Console de rendu principale */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Écran d'affichage Canvas2D */}
            <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl bg-[#0c0c0e] border border-[#1a1a1e] p-3 sm:p-4 shadow-2xl overflow-hidden relative group">
              {/* Barre de fenêtre CRT */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1e] bg-black/70 rounded-t-2xl text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-neutral-400 text-[11px]">
                    21st.dev // mode: {params.renderMode} [tint: {params.tint}]
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>FLICKER ACTIVE</span>
                </div>
              </div>

              {/* Le Canvas Raster principal */}
              <div className="relative w-full aspect-[16/10] bg-black rounded-b-2xl overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={680}
                  height={420}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Bande inférieure d'état télémétrique */}
              <div className="px-4 py-3 bg-black/80 border-t border-[#1a1a1e] rounded-b-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
                <div className="flex items-center space-x-3">
                  <span>Coverage: {params.coverage}%</span>
                  <span>•</span>
                  <span>Cell: {params.cellSize}px</span>
                  <span>•</span>
                  <span>Contrast: {params.contrast}%</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>60 FPS Raster Pipeline</span>
                </div>
              </div>
            </div>

            {/* Panneau de contrôle des paramètres (21st.dev recipe sliders) */}
            <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl bg-[#0c0c0e] border border-[#1a1a1e] p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#1a1a1e] pb-3">
                  <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Paramètres du Recipe</span>
                  </div>
                  <button
                    onClick={() =>
                      setActiveSubject(activeSubject === 'sentinel' ? 'matrix-core' : 'sentinel')
                    }
                    className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black border border-[#1a1a1e] text-blue-400 hover:text-white transition"
                  >
                    Changer Sujet
                  </button>
                </div>

                {/* Mode de rendu (renderMode) */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-neutral-400 block">Render Mode</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'hexdump', label: 'Hexdump' },
                      { id: 'matrix', label: 'Matrix Rain' },
                      { id: 'braille', label: 'Braille' },
                      { id: 'characters', label: 'Characters' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setParams({ ...params, renderMode: mode.id })}
                        className={`py-2 px-3 rounded-xl font-mono text-xs transition ${
                          params.renderMode === mode.id
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-black border border-[#1a1a1e] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taille de cellule (cellSize) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Cell Size</span>
                    <span className="text-white">{params.cellSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="1"
                    value={params.cellSize}
                    onChange={(e) => setParams({ ...params, cellSize: Number(e.target.value) })}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Couverture (coverage 93%) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Coverage</span>
                    <span className="text-white">{params.coverage}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={params.coverage}
                    onChange={(e) => setParams({ ...params, coverage: Number(e.target.value) })}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Contraste (contrast 115%) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Contrast</span>
                    <span className="text-white">{params.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={params.contrast}
                    onChange={(e) => setParams({ ...params, contrast: Number(e.target.value) })}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Bloom Post-Effect (bloom 60) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Bloom Intensity</span>
                    <span className="text-white">{params.bloom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.bloom}
                    onChange={(e) => setParams({ ...params, bloom: Number(e.target.value) })}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Scanlines CRT (scanLines 28) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">CRT ScanLines</span>
                    <span className="text-white">{params.scanLines}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={params.scanLines}
                    onChange={(e) => setParams({ ...params, scanLines: Number(e.target.value) })}
                    className="w-full accent-emerald-500 bg-neutral-900 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Bouton reset / réinitialisation aux paramètres JSON exacts */}
              <button
                onClick={() =>
                  setParams({
                    renderMode: 'hexdump',
                    cellSize: 12,
                    coverage: 93,
                    contrast: 115,
                    edgeEmphasis: 40,
                    tint: '#00ff66',
                    tintOpacity: 45,
                    scanLines: 28,
                    vignette: 38,
                    chromatic: 40,
                    bloom: 60,
                    filmGrain: 40,
                    glitch: 20,
                    animStyle: 'flicker',
                    animated: true,
                  })
                }
                className="w-full py-2.5 rounded-full bg-black hover:bg-neutral-900 border border-[#1a1a1e] hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Restaurer le Recipe 21st.dev</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
