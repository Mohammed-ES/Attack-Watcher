import { useMemo } from 'react';

/**
 * HeroBeam : Rideau d'orgues lumineuses en U (Signature Aura.build).
 * Reproduit fidèlement la composition parabolique de colonnes lumineuses
 * avec reflet d'horizon argenté et dégradé bleu cobalt profond (media_1794529717275_a34f0531.jpg).
 */
export default function HeroBeam() {
  const COLUMN_COUNT = 24;

  // Calcul parabolique de la hauteur de chaque colonne
  const columns = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }, (_, i) => {
      const normalized = (i - (COLUMN_COUNT - 1) / 2) / ((COLUMN_COUNT - 1) / 2); // de -1 à +1
      // Courbe en cuvette : plus basse au centre (~38%), culminante sur les côtés (~92%)
      const heightPercent = 38 + Math.pow(Math.abs(normalized), 2.2) * 54;
      const opacity = 0.85 + Math.pow(Math.abs(normalized), 1.5) * 0.15;
      return {
        id: i,
        height: `${heightPercent.toFixed(1)}%`,
        opacity,
      };
    });
  }, [COLUMN_COUNT]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-center z-[1] select-none">
      {/* Halo d'ambiance bleu électrique éclatant à la base */}
      <div className="absolute bottom-0 w-full max-w-7xl h-[480px] bg-gradient-to-t from-blue-600/40 via-blue-700/20 to-transparent blur-[130px] pointer-events-none" />

      {/* Conteneur des colonnes verticales en U agrandi pour un rendu majestueux */}
      <div className="relative w-full h-[680px] sm:h-[820px] flex items-end justify-between px-2 sm:px-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex-1 mx-[1.5px] sm:mx-[2.5px] relative rounded-t-sm overflow-hidden"
            style={{
              height: col.height,
              opacity: col.opacity,
            }}
          >
            {/* Dégradé Aura.build avec brillance positionnée bas pour ne jamais couper le texte */}
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(37, 99, 235, 0.25) 30%, rgba(59, 130, 246, 0.65) 60%, rgba(147, 197, 253, 0.9) 78%, rgba(255, 255, 255, 0.98) 83%, rgba(59, 130, 246, 0.9) 88%, rgba(15, 23, 42, 0.95) 95%, rgba(0, 0, 0, 1) 100%)',
              }}
            />

            {/* Bordure verticale fine pour séparer les lames */}
            <div className="absolute inset-y-0 left-0 w-[1px] bg-white/10" />
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/50" />
          </div>
        ))}

        {/* Lueur d'horizon blanche repositionnée en bas sous les boutons (aucun chevauchement de texte) */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: '17%',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.7) 50%, transparent 95%)',
            boxShadow: '0 0 16px rgba(255, 255, 255, 0.8), 0 0 35px rgba(59, 130, 246, 0.8)',
          }}
        />

        {/* Masque dégradé noir à la base pour fondre le bas des colonnes */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
