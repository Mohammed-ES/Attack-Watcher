import { Zap, ShieldCheck, Cpu, Database, CheckCircle2, Download } from 'lucide-react';
import { ScrollReveal } from '../animations';

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
    <section id="capabilities" className="py-24 sm:py-32 bg-black border-t border-[#1a1a1e] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Intelligence at every layer
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Comprehensive network observability and multi-vector attack detection powered by supervised ML.
            </p>
          </div>
        </ScrollReveal>

        {/* Grille 6 cartes (3 colonnes x 2 lignes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <ScrollReveal
                key={c.num}
                direction="up"
                delay={0.08 * (i + 1)}
                className="h-full"
              >
                <div className="p-7 rounded-2xl bg-[#0c0c0e] border border-[#1a1a1e] hover:border-neutral-700 transition-all duration-300 group flex flex-col justify-between h-full space-y-6">
                  {/* Ligne haute : Icône et numéro d'étape 01..06 */}
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-black border border-[#1a1a1e] flex items-center justify-center text-neutral-400 group-hover:text-blue-500 group-hover:border-blue-500/40 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-medium text-neutral-600 group-hover:text-neutral-400 transition">
                      {c.num}
                    </span>
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-blue-400 transition">
                      {c.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
