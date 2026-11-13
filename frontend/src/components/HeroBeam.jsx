import { useMemo } from 'react';

/**
 * HeroBeam : Rideau d'orgues lumineuses en U (Signature Aura.build).
 * Reproduit fidèlement la composition parabolique de colonnes lumineuses
 * avec reflet d'horizon argenté et dégradé bleu cobalt profond (media_1794529717275_a34f0531.jpg).
 */
export default function HeroBeam() {
  const COLUMN_COUNT = 26;

  // Calcul parabolique de la hauteur de chaque colonne
  const columns = useMemo(() => {
    return Array.from({ length: COLUMN_COUNT }, (_, i) => {
      const normalized = (i - (COLUMN_COUNT - 1) / 2) / ((COLUMN_COUNT - 1) / 2); // de -1 à +1
      // Courbe en cuvette : plus basse au centre (~36%), culminante sur les côtés (~92%)
      const heightPercent = 36 + Math.pow(Math.abs(normalized), 2.1) * 56;
      const opacity = 0.8 + Math.pow(Math.abs(normalized), 1.6) * 0.2;
      return {
        id: i,
        height: `${heightPercent.toFixed(1)}%`,
        opacity,
      };
    });
  }, [COLUMN_COUNT]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-center -z-10 select-none">
      {/* Halo d'ambiance bleu profond à la base */}
      <div className="absolute bottom-0 w-[1400px] h-[500px] bg-gradient-to-t from-blue-700/35 via-blue-900/20 to-transparent blur-[120px] -z-20" />

      {/* Conteneur des colonnes verticales en U */}
      <div className="relative w-full h-[650px] sm:h-[720px] flex items-end justify-between px-2 sm:px-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex-1 mx-[1.5px] sm:mx-[2.5px] relative rounded-t-sm overflow-hidden"
            style={{
              height: col.height,
              opacity: col.opacity,
            }}
          >
            {/* Dégradé spécifique Aura.build avec la bande de brillance métallique au centre */}
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(37, 99, 235, 0.25) 25%, rgba(96, 165, 250, 0.7) 48%, rgba(255, 255, 255, 0.95) 54%, rgba(96, 165, 250, 0.85) 60%, rgba(37, 99, 235, 0.9) 78%, rgba(0, 0, 0, 0.95) 100%)',
              }}
            />

            {/* Bordure verticale fine pour séparer les lames */}
            <div className="absolute inset-y-0 left-0 w-[1px] bg-white/10" />
            <div className="absolute inset-y-0 right-0 w-[1px] bg-black/40" />
          </div>
        ))}

        {/* Lueur d'horizon blanche à travers toutes les colonnes */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: '42%',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.7) 50%, transparent 95%)',
            filter: 'blur(1px)',
          }}
        />

        {/* Masque dégradé noir à la base pour fondre le bas des colonnes */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
