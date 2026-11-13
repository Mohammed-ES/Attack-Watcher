import { useState } from 'react';
import { Search, BarChart3, ShieldCheck, Key, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../animations';

export default function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      num: '01',
      label: 'ÉTAPE 01',
      title: 'Sélection & Ingestion',
      desc: 'Capture et extraction vectorielle des flux TCP/IP à partir des paquets réseau bruts du dataset CIC-IDS2017.',
      icon: Search,
      yOffset: 'translate-y-0', // Position haute
      telemetry: '10 Features Clés',
    },
    {
      num: '02',
      label: 'ÉTAPE 02',
      title: 'Standardisation',
      desc: 'Normalisation StandardScaler fittée strictement post-split sans fuite de données statistique vers le test.',
      icon: BarChart3,
      yOffset: 'translate-y-8', // Position basse (ondulation)
      telemetry: 'Zero Leakage Split',
    },
    {
      num: '03',
      label: 'ÉTAPE 03',
      title: 'Inférence Champion',
      desc: 'Classification microseconde (< 0.05 ms) par RandomForest optimisé face à XGBoost pour une précision absolue.',
      icon: ShieldCheck,
      yOffset: '-translate-y-2', // Position haute (ondulation)
      telemetry: 'Latence < 0.05 ms',
    },
    {
      num: '04',
      label: 'ÉTAPE 04',
      title: 'Verdict & Protection',
      desc: 'Discrimination certifiée entre trafic bénin et attaque DDoS par saturation, prête pour export SIEM et audit.',
      icon: Key,
      yOffset: 'translate-y-6', // Position basse (ondulation)
      telemetry: 'Bénin vs DDoS',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-36 bg-black border-t border-[#1a1a1e] relative overflow-hidden backdrop-blur-sm">
      {/* Halos d'ambiance d'arrière-plan */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête centré façon "Le Processus Atlas" adapté au design de notre site */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-20 sm:mb-28 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
              <Zap className="w-3.5 h-3.5" />
              <span>Pipeline & Méthodologie</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Le Processus de Détection
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Une fluidité architecturale appliquée à l'inspection en temps réel et la neutralisation des attaques DDoS.
            </p>
          </div>
        </ScrollReveal>

        {/* Processus 4 étapes avec ligne de liaison ondulée animée (Desktop) */}
        <div className="relative">
          {/* Ligne de liaison ondulée continue avec particules de flux animées (Visible sur md et +) */}
          <div className="hidden md:block absolute top-[4.2rem] left-0 right-0 w-full h-[140px] pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 140"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Filtre de lueur néon pour la liaison animée */}
                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Dégradé lumineux le long du tracé */}
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#2563eb" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* 1. Tracé de fond statique discret */}
              <path
                d="M 125 45 C 220 45, 280 85, 375 85 C 470 85, 530 35, 625 35 C 720 35, 780 75, 875 75"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />

              {/* 2. Liaison ondulée principale avec effet de flux dynamique */}
              <path
                d="M 125 45 C 220 45, 280 85, 375 85 C 470 85, 530 35, 625 35 C 720 35, 780 75, 875 75"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-[dash_6s_linear_infinite]"
                style={{
                  strokeDasharray: '80 320',
                  animation: 'flowDash 4s linear infinite',
                }}
              />

              {/* 3. Photon lumineux 1 traversant la liaison d'Étape 01 à 04 */}
              <circle r="4.5" fill="#38bdf8" filter="url(#laserGlow)">
                <animateMotion
                  path="M 125 45 C 220 45, 280 85, 375 85 C 470 85, 530 35, 625 35 C 720 35, 780 75, 875 75"
                  dur="3.8s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* 4. Photon lumineux 2 en décalage de phase */}
              <circle r="3" fill="#60a5fa" opacity="0.85">
                <animateMotion
                  path="M 125 45 C 220 45, 280 85, 375 85 C 470 85, 530 35, 625 35 C 720 35, 780 75, 875 75"
                  dur="3.8s"
                  begin="1.9s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>

          {/* Grille des 4 étapes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isHovered = hoveredStep === idx;

              return (
                <ScrollReveal
                  key={step.num}
                  direction="up"
                  delay={0.08 * (idx + 1)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div
                    onMouseEnter={() => setHoveredStep(idx)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className="w-full flex flex-col items-center"
                  >
                    {/* Libellé d'étape en haut */}
                    <span className="text-[11px] font-mono tracking-widest text-neutral-400 uppercase mb-4 group-hover:text-blue-400 transition-colors duration-200">
                      {step.label}
                    </span>

                    {/* Carte icône avec décalage vertical ondulant reproduisant le visuel de référence */}
                    <div className={`transition-all duration-500 ease-out md:${step.yOffset}`}>
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0c0c0e] border flex items-center justify-center relative transition-all duration-300 shadow-2xl ${
                          isHovered
                            ? 'border-blue-500/80 bg-[#121218] shadow-[0_0_35px_rgba(37,99,235,0.4)] scale-105'
                            : 'border-[#1f1f26] hover:border-neutral-600'
                        }`}
                      >
                        {/* Halo interne au survol */}
                        <div
                          className={`absolute inset-0 rounded-3xl bg-blue-600/10 blur-xl transition-opacity duration-300 pointer-events-none ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}
                        />

                        {/* Icône de l'étape */}
                        <Icon
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 relative z-10 ${
                            isHovered ? 'text-blue-400 scale-110' : 'text-neutral-300 group-hover:text-white'
                          }`}
                        />

                        {/* Pastille de numéro discret */}
                        <span className="absolute top-2 right-2.5 text-[10px] font-mono text-neutral-600 group-hover:text-blue-400 transition-colors">
                          {step.num}
                        </span>
                      </div>
                    </div>

                    {/* Bloc titre et description textuelle */}
                    <div className="mt-8 md:mt-14 space-y-2.5 max-w-xs px-2">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-200">
                        {step.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                        {step.desc}
                      </p>

                      {/* Tag télémétrique discret */}
                      <div className="pt-2">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-black/80 border border-[#1a1a1e] text-neutral-400 group-hover:text-blue-300 group-hover:border-blue-500/30 transition">
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          <span>{step.telemetry}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Ligne de liaison verticale animée pour mobile (Visible sous md) */}
        <div className="md:hidden mt-8 flex justify-center">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-neutral-500">
            <span>Flux séquentiel vectorisé</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-white">Validation 100%</span>
          </div>
        </div>
      </div>

      {/* Animation CSS pour le flux de la liaison */}
      <style>{`
        @keyframes flowDash {
          0% {
            stroke-dashoffset: 400;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
