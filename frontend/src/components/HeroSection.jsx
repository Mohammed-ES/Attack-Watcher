import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import HeroBeam from './HeroBeam';
import { ScrollReveal } from '../animations';

/**
 * Hero Section inspirée fidèlement de l'affiche de référence (media_1794527656110_13d404f1.jpg).
 * Typographie cinématique en 3 lignes, badge technique rectangulaire,
 * boutons sci-fi avec coins en équerre (brackets) et halo atmosphérique.
 */
export default function HeroSection({ onLaunchConsole }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] py-28 sm:py-36 bg-black overflow-hidden flex items-center border-t border-[#141418]"
    >
      {/* Rayon lumineux bleu atmosphérique en arrière-plan */}
      <HeroBeam />

      {/* Grille digitale en trame de fond */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Contenu principal gauche (style exact de media_1794527656110_13d404f1.jpg) */}
        <div className="lg:col-span-8 flex flex-col items-start text-left space-y-7">
          {/* Badge rectangulaire bicolore avec coins nets */}
          <ScrollReveal direction="left" delay={0.1}>
            <div className="inline-flex items-center rounded-none bg-neutral-950/90 border border-neutral-800 px-2.5 py-1 text-[11px] font-mono tracking-wider shadow-md">
              <span className="font-semibold text-neutral-300 uppercase">AI INFRASTRUCTURE</span>
              <span className="mx-2 text-neutral-600">|</span>
              <span className="text-blue-500 font-semibold uppercase">NOW IN PRODUCTION</span>
            </div>
          </ScrollReveal>

          {/* Titre cinématique percutant en 3 lignes */}
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
              Built to inspect.
              <br />
              Engineered to defend.
              <br />
              Trained to evolve.
            </h1>
          </ScrollReveal>

          {/* Descriptif haute fidélité */}
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl font-light leading-relaxed">
              Attack Watcher is a modular intelligence platform for engineering and security operations teams.
              Real-time infrastructure monitoring, predictive DDoS scaling, and full-stack traffic orchestration.
              One layer. Everything protected.
            </p>
          </ScrollReveal>

          {/* Boutons d'action avec coins en équerre (brackets sci-fi) */}
          <ScrollReveal direction="up" delay={0.4}>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Bouton principal bleu plein avec brackets */}
              <button
                onClick={() => {
                  if (onLaunchConsole) onLaunchConsole();
                  scrollTo('console');
                }}
                className="relative group px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 flex items-center space-x-2.5 shadow-lg shadow-blue-600/30"
              >
                {/* Coins en équerre (brackets) */}
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white pointer-events-none" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-white pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-white pointer-events-none" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white pointer-events-none" />

                <span>Lancer la Console</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Bouton secondaire transparent avec brackets */}
              <button
                onClick={() => scrollTo('how-it-works')}
                className="relative group px-6 py-3.5 bg-transparent hover:bg-neutral-900/60 text-neutral-300 hover:text-white border border-neutral-800 text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 flex items-center space-x-2"
              >
                {/* Coins en équerre (brackets) */}
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-blue-400 pointer-events-none" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-blue-400 pointer-events-none" />
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-blue-400 pointer-events-none" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-blue-400 pointer-events-none" />

                <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Explorer le Pipeline</span>
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Côté Droit : Silhouette cybernétique & Halo matriciel */}
        <div className="lg:col-span-4 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-b from-blue-950/20 to-black border border-neutral-800/80 p-6 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            {/* Lueur d'ambiance */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* En-tête de carte télémétrique */}
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 border-b border-neutral-800 pb-3">
              <span className="text-neutral-400">DEFENSE_MATRIX</span>
              <span className="text-emerald-400">SYNCHRONIZED</span>
            </div>

            {/* Visualisation matricielle abstraite */}
            <div className="py-6 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-400">Inspection Status</span>
                <span className="text-white font-semibold">Active Monitoring</span>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-400">Class Target</span>
                <span className="text-blue-400 font-semibold">DDoS Flooding (CIC)</span>
              </div>
              <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-400">Inference Core</span>
                <span className="text-emerald-400 font-semibold">Supervised RF</span>
              </div>
            </div>

            {/* Bas de carte */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span>ZERO_DATA_LEAKAGE</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
