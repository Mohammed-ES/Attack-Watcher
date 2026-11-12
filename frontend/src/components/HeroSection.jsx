import { motion } from 'framer-motion';
import { ArrowRight, FileText, Activity, ShieldCheck, Zap, Database } from 'lucide-react';
import HeroBeam from './HeroBeam';
import { ScrollReveal } from '../animations';

export default function HeroSection({ onLaunchConsole }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden flex flex-col items-center text-center">
      {/* Faisceaux lumineux verticaux en éventail (Signature Aura) */}
      <HeroBeam />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 z-10 flex flex-col items-center">
        {/* Badge d'en-tête futuriste façon Aura / Vercel */}
        <ScrollReveal direction="down" delay={0.1}>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0c0c0e]/90 border border-[#222228] text-xs text-neutral-300 mb-6 shadow-xl backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
              CIC-IDS2017 Dataset • Moteur Supervisé Actif
            </span>
          </div>
        </ScrollReveal>

        {/* Titre Principal Majestueux */}
        <ScrollReveal direction="up" delay={0.2}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
            Detection That Scales.
          </h1>
        </ScrollReveal>

        {/* Sous-titre épuré */}
        <ScrollReveal direction="up" delay={0.3}>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Architecture de Machine Learning haute performance pour l’inspection des flux réseau,
            l’identification instantanée des attaques DDoS et l’analyse par lot de captures CSV.
          </p>
        </ScrollReveal>

        {/* Boutons d'action arrondis en pilule (Pill buttons) */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => {
                if (onLaunchConsole) onLaunchConsole();
                scrollTo('console');
              }}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-semibold tracking-tight transition shadow-2xl shadow-blue-600/30 active:scale-95 flex items-center space-x-2"
            >
              <span>Lancer la Détection</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <a
              href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-full bg-[#0c0c0e] hover:bg-neutral-900 text-neutral-200 hover:text-white border border-[#222228] hover:border-neutral-700 text-xs sm:text-sm font-medium tracking-tight transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>Architecture & Modèles</span>
            </a>
          </div>
        </ScrollReveal>

        {/* HELLO SHOWCASE SECTION : Présentation animée du logo .gif & télémétrie */}
        <ScrollReveal direction="zoom" delay={0.5} className="w-full mt-14 sm:mt-18">
          <div className="relative mx-auto max-w-4xl rounded-3xl bg-[#0c0c0e]/95 border border-[#1f1f24] p-2 sm:p-3 shadow-[0_0_50px_rgba(37,99,235,0.15)] backdrop-blur-2xl">
            {/* Lueur d'ambiance bleue sous le conteneur */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-sky-500/10 to-indigo-600/20 rounded-3xl blur-2xl -z-10 opacity-70"></div>

            {/* Barre de fenêtre supérieure façon IDE / Terminal moderne */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1e] text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 font-mono text-[11px] text-neutral-500">
                  attack-watcher-core // model: random-forest-champion
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-neutral-500 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>STATUS: OPERATIONAL</span>
              </div>
            </div>

            {/* Corps du Showcase avec animation .GIF et badges techniques */}
            <div className="p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Badge gauche : Performance */}
              <div className="w-full md:w-1/3 flex flex-col space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-black/60 border border-[#1a1a1e]">
                  <div className="flex items-center space-x-2 text-blue-500 mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Modèle Champion</span>
                  </div>
                  <div className="text-xl font-bold text-white">Random Forest</div>
                  <div className="text-xs text-neutral-500 mt-0.5">F1-Score 1.000 vs XGBoost</div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-[#1a1a1e]">
                  <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Latence</span>
                  </div>
                  <div className="text-xl font-bold text-white">&lt; 0.05 ms</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Par flux réseau unitaire</div>
                </div>
              </div>

              {/* Centre : Animation .GIF officielle avec halo bleu */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Anneau d'onde lumineuse */}
                <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-blue-600/10 blur-xl animate-pulse"></div>

                <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl bg-white p-3 shadow-2xl border border-white/20 flex items-center justify-center overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                  <img
                    src="/attack-watcher-animated-logo.gif"
                    alt="Attack Watcher Animated Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="mt-4 inline-flex items-center space-x-2 text-xs font-mono text-neutral-400">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  <span>Surveillance temps réel active</span>
                </div>
              </div>

              {/* Badge droit : Données & Pipeline */}
              <div className="w-full md:w-1/3 flex flex-col space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-black/60 border border-[#1a1a1e]">
                  <div className="flex items-center space-x-2 text-sky-400 mb-1">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Vecteur d'Entrée</span>
                  </div>
                  <div className="text-xl font-bold text-white">10 Features Clés</div>
                  <div className="text-xs text-neutral-500 mt-0.5">Standardisées sans fuite de données</div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-[#1a1a1e]">
                  <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Partition</span>
                  </div>
                  <div className="text-xl font-bold text-white">80% / 20% Split</div>
                  <div className="text-xs text-neutral-500 mt-0.5">StratifiedShuffleSplit rigoureux</div>
                </div>
              </div>
            </div>

            {/* Pied du Showcase : Mini bande de statut */}
            <div className="px-6 py-3 bg-black/80 border-t border-[#1a1a1e] rounded-b-3xl flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Dataset: Canadian Institute for Cybersecurity (CIC-IDS2017)</span>
              </span>
              <span className="text-neutral-500">Backend: FastAPI 0.162 + Pydantic v2</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Petit indicateur de défilement subtil */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="mt-14 text-neutral-600 cursor-pointer"
        onClick={() => scrollTo('how-it-works')}
      >
        <span className="text-[11px] font-mono tracking-widest uppercase block text-neutral-500 mb-2">Explorer</span>
        <div className="w-5 h-9 rounded-full border border-[#222228] mx-auto flex items-start justify-center p-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
}
