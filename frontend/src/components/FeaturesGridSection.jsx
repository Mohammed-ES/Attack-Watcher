import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Database, CheckCircle2, Download, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '../animations';

export default function FeaturesGridSection() {
  const cards = [
    {
      num: '01',
      title: 'Real-time Parsing',
      subtitle: 'Inspection Réseau',
      desc: 'Extraction et parsing instantané des 10 variables fondamentales du trafic réseau IP/TCP à partir des paquets bruts capturés.',
      icon: Zap,
      accent: 'from-blue-500/20 to-cyan-500/10',
      tag: 'TCP/IP Flow',
    },
    {
      num: '02',
      title: 'Anti-Leakage Scaling',
      subtitle: 'Standardisation Sévère',
      desc: 'Standardisation StandardScaler fittée rigoureusement post-split stratifié, éliminant toute contamination statistique entre Train et Test.',
      icon: ShieldCheck,
      accent: 'from-sky-500/20 to-blue-500/10',
      tag: 'Zero Leakage',
    },
    {
      num: '03',
      title: 'Dual Model Engine',
      subtitle: 'Benchmark Continu',
      desc: 'Entraînement et benchmark continu entre RandomForest et XGBoost avec sélection automatique du champion au F1-Score.',
      icon: Cpu,
      accent: 'from-indigo-500/20 to-blue-500/10',
      tag: 'Champion Select',
    },
    {
      num: '04',
      title: 'Batch CSV Inspection',
      subtitle: 'Traitement Massif',
      desc: 'Analyse vectorisée de fichiers CSV volumineux comprenant des centaines de milliers de flux sans saturation mémoire.',
      icon: Database,
      accent: 'from-blue-600/20 to-indigo-600/10',
      tag: 'High Throughput',
    },
    {
      num: '05',
      title: 'Zero False Positives',
      subtitle: 'Discrimination Précise',
      desc: 'Calibration stricte du seuil de décision pour distinguer avec certitude les pics légitimes des attaques par inondation.',
      icon: CheckCircle2,
      accent: 'from-emerald-500/20 to-blue-500/10',
      tag: 'Precision 99.9%',
    },
    {
      num: '06',
      title: 'Export & Telemetry',
      subtitle: 'Intégration SIEM',
      desc: 'Téléchargement direct du rapport enrichi avec colonnes de prédiction et probabilité pour audit immédiat et intégration SOC.',
      icon: Download,
      accent: 'from-cyan-500/20 to-blue-500/10',
      tag: 'SOC Ready',
    },
  ];

  return (
    <section id="capabilities" className="py-24 sm:py-36 bg-black/60 border-t border-[#1a1a1e] relative overflow-hidden backdrop-blur-sm">
      {/* Fond atmosphérique : Halos lumineux bleus profonds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Trame de grille cybernétique discrète */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête centré épuré */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Modular Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Intelligence at every layer
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Comprehensive network observability and multi-vector attack detection powered by supervised ML.
            </p>
          </div>
        </ScrollReveal>

        {/* Grille 6 cartes (3 colonnes x 2 lignes) avec animations dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;

            return (
              <ScrollReveal
                key={c.num}
                direction="up"
                delay={0.06 * (i + 1)}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative p-7 rounded-3xl bg-[#0c0c0e]/90 border border-[#1a1a1e] hover:border-blue-500/50 hover:shadow-[0_0_35px_rgba(37,99,235,0.2)] transition-all duration-300 group flex flex-col justify-between h-full space-y-6 overflow-hidden backdrop-blur-xl"
                >
                  {/* Effet de brillance / glare gradient au survol */}
                  <div
                    className={`absolute -inset-full bg-gradient-to-r ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none`}
                  />

                  {/* Ligne haute : Icône en squircle, tag et numéro d'étape 01..06 */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-black border border-[#1a1a1e] group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center text-neutral-400 group-hover:text-blue-400 transition-all duration-300 shadow-md">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/60 border border-[#1a1a1e] text-neutral-400 group-hover:text-blue-300 group-hover:border-blue-500/30 transition">
                        {c.tag}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-neutral-600 group-hover:text-blue-400 transition">
                      {c.num}
                    </span>
                  </div>

                  {/* Contenu textuel */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-blue-300 transition">
                      {c.subtitle}
                    </span>
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-blue-400 transition">
                      {c.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  {/* Pied de carte interactif avec lien subtil */}
                  <div className="relative z-10 pt-4 border-t border-[#1a1a1e] flex items-center justify-between text-xs font-mono text-neutral-500 group-hover:text-neutral-300 transition">
                    <span className="text-[11px]">Pipeline Step {c.num}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-neutral-500 group-hover:text-blue-400" />
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
