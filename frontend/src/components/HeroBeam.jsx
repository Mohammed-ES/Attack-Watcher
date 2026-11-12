export default function HeroBeam() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-center -z-10">
      {/* Halo radial bleu profond */}
      <div className="absolute bottom-0 w-[1200px] h-[550px] bg-gradient-to-t from-blue-600/40 via-blue-700/20 to-transparent blur-3xl opacity-70"></div>
      
      {/* Rayons lumineux verticaux stylisés (Rideau de lumière) */}
      <div className="relative w-full max-w-6xl h-[420px] flex items-end justify-center px-4">
        {/* Rayons SVG vectoriels nets */}
        <svg
          viewBox="0 0 1000 400"
          className="w-full h-full opacity-85"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="beamGradientMain" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#2563eb" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamGradientSide" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Faisceau central éclatant */}
          <path d="M 450 400 L 485 0 L 515 0 L 550 400 Z" fill="url(#beamGradientMain)" />
          
          {/* Faisceaux gauche */}
          <path d="M 410 400 L 450 0 L 475 0 L 440 400 Z" fill="url(#beamGradientSide)" opacity="0.9" />
          <path d="M 360 400 L 400 0 L 420 0 L 385 400 Z" fill="url(#beamGradientSide)" opacity="0.8" />
          <path d="M 300 400 L 330 0 L 350 0 L 320 400 Z" fill="url(#beamGradientSide)" opacity="0.65" />
          <path d="M 230 400 L 250 0 L 270 0 L 245 400 Z" fill="url(#beamGradientSide)" opacity="0.5" />
          <path d="M 150 400 L 160 0 L 180 0 L 165 400 Z" fill="url(#beamGradientSide)" opacity="0.35" />
          <path d="M 60 400 L 70 0 L 90 0 L 75 400 Z" fill="url(#beamGradientSide)" opacity="0.2" />

          {/* Faisceaux droite */}
          <path d="M 590 400 L 550 0 L 525 0 L 560 400 Z" fill="url(#beamGradientSide)" opacity="0.9" />
          <path d="M 640 400 L 600 0 L 580 0 L 615 400 Z" fill="url(#beamGradientSide)" opacity="0.8" />
          <path d="M 700 400 L 670 0 L 650 0 L 680 400 Z" fill="url(#beamGradientSide)" opacity="0.65" />
          <path d="M 770 400 L 750 0 L 730 0 L 755 400 Z" fill="url(#beamGradientSide)" opacity="0.5" />
          <path d="M 850 400 L 840 0 L 820 0 L 835 400 Z" fill="url(#beamGradientSide)" opacity="0.35" />
          <path d="M 940 400 L 930 0 L 910 0 L 925 400 Z" fill="url(#beamGradientSide)" opacity="0.2" />
        </svg>

        {/* Lueur blanche horizontale au point d'impact bas */}
        <div className="absolute bottom-0 w-3/4 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]"></div>
        <div className="absolute bottom-0 w-1/2 h-[12px] bg-blue-400 blur-md"></div>
      </div>
    </div>
  );
}
