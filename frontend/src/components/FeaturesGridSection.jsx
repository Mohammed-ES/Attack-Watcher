import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Database, CheckCircle2, Download } from 'lucide-react';

export default function FeaturesGridSection() {
  const cards = [
    {
      num: '01',
      title: 'Real-time Parsing',
      desc: 'Extraction et parsing instantané des 10 variables fondamentales du trafic réseau IP/TCP à partir des paquets bruts.',
      icon: Zap,
    },
    {
      num: '02',
      title: 'Anti-Leakage Scaling',
      desc: 'Standardisation StandardScaler fittée rigoureusement post-split stratifié, éliminant toute contamination statistique.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Dual Model Engine',
      desc: 'Entraînement et benchmark continu entre RandomForest et XGBoost avec sélection automatique du champion au F1-Score.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Batch CSV Inspection',
      desc: 'Analyse vectorisée de fichiers CSV volumineux (plusieurs centaines de milliers de flux) sans saturation mémoire.',
      icon: Database,
    },
    {
      num: '05',
      title: 'Zero False Positives',
      desc: 'Calibration stricte du seuil de décision pour distinguer avec certitude les pics légitimes des attaques par inondation.',
      icon: CheckCircle2,
    },
    {
      num: '06',
      title: 'Export & Telemetry',
      desc: 'Téléchargement direct du rapport enrichi avec colonnes de prédiction et de probabilité pour intégration aux outils SIEM.',
      icon: Download,
    },
  ];

  return (
    <section id="capabilities" className="py-24 sm:py-32 bg-black border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Intelligence at every layer
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-normal">
            Comprehensive network observability and multi-vector attack detection powered by supervised ML.
          </p>
        </div>

        {/* Grille 6 cartes (3 colonnes x 2 lignes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl bg-zinc-950/70 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 p-6 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-blue-400 group-hover:border-blue-500/30 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-xs text-zinc-500 font-semibold">
                      {c.num}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight mb-2 group-hover:text-blue-400 transition">
                    {c.title}
                  </h3>

                  <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Standardisé CIC-IDS2017</span>
                  <span className="text-blue-500/80">Actif</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
