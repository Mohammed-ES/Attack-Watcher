import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Database, CheckCircle2, Download, ArrowUpRight, Layers } from 'lucide-react';
import { ScrollReveal } from '../animations';

export default function FeaturesGridSection() {
  const cards = [
    {
      num: '01',
      title: 'Lecture de fichiers de flux',
      subtitle: 'Inspection Réseau',
      desc: 'Extraction des 9 variables discriminantes du trafic réseau IP/TCP sans dépendance au port de destination.',
      icon: Zap,
      tag: 'Flux TCP/IP',
      metric: '9 Variables',
      accent: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      num: '02',
      title: 'Pipeline anti-fuite',
      subtitle: 'Imputation Intégrée',
      desc: 'Imputation médiane apprise sur l\'entraînement uniquement. Pas de normalisation.',
      icon: ShieldCheck,
      tag: 'Séparation stricte',
      metric: 'SimpleImputer',
      accent: 'from-sky-500/20 to-blue-500/10',
    },
    {
      num: '03',
      title: 'Random Forest Classifier',
      subtitle: 'Pipeline Scikit-Learn',
      desc: 'Random Forest entraîné sur CIC-IDS2017, testé sur CIC-DDoS2019.',
      icon: Cpu,
      tag: 'RandomForest',
      metric: 'scikit-learn 1.6.1',
      accent: 'from-indigo-500/20 to-blue-500/10',
    },
    {
      num: '04',
      title: 'Analyse par lot',
      subtitle: 'Traitement Fichier',
      desc: 'Fichiers CSV jusqu\'à 50 Mo, limite appliquée côté serveur.',
      icon: Database,
      tag: 'Par lot',
      metric: '50 Mo max',
      accent: 'from-blue-600/20 to-indigo-600/10',
    },
    {
      num: '05',
      title: 'Évaluation Externe',
      subtitle: 'Jeux Réservés Dédiés',
      desc: 'Validation sur jeux de données externes réservés (CIC-IDS2017 et CIC-DDoS2019) avec métriques exposées via l\'API.',
      icon: CheckCircle2,
      tag: 'Test Externe',
      metric: 'Métriques Réelles',
      accent: 'from-emerald-500/20 to-blue-500/10',
    },
    {
      num: '06',
      title: 'Export CSV annoté',
      subtitle: 'Rapports Enrichis',
      desc: 'Génération et téléchargement direct de fichiers CSV enrichis des colonnes Attack_Watcher_Prediction et DDoS_Probability.',
      icon: Download,
      tag: 'Export CSV',
      metric: 'Export Direct',
      accent: 'from-cyan-500/20 to-blue-500/10',
    },
  ];

  return (
    <section
      id="capabilities"
      className="py-24 sm:py-36 bg-black border-t border-[#1a1a1e] relative overflow-hidden backdrop-blur-sm"
    >
      {/* Halos lumineux d'ambiance bleus profonds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Trame de grille discrète */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.8) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête centré */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
              <Layers className="w-3.5 h-3.5" />
              <span>Couches d'Inspection</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              L'intelligence à chaque couche
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Observabilité réseau complète et détection multi-vectorielle en continu par machine learning supervisé.
            </p>
          </div>
        </ScrollReveal>

        {/* Grille de 6 cartes modernes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <ScrollReveal
                key={card.num}
                direction="up"
                delay={0.06 * (idx + 1)}
                className="h-full"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative p-7 rounded-3xl bg-[#0c0c0e] border border-[#1a1a1e] hover:border-blue-500/50 hover:shadow-[0_0_35px_rgba(37,99,235,0.25)] transition-all duration-300 group flex flex-col justify-between h-full space-y-6 overflow-hidden"
                >
                  {/* Glare gradient au survol */}
                  <div
                    className={`absolute -inset-full bg-gradient-to-r ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none`}
                  />

                  {/* Ligne haute : Icône squircle, tag et numéro */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-black border border-[#1a1a1e] group-hover:border-blue-500/40 group-hover:bg-blue-600/10 flex items-center justify-center text-neutral-400 group-hover:text-blue-400 transition-all duration-300 shadow-md">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/60 border border-[#1a1a1e] text-neutral-400 group-hover:text-blue-300 group-hover:border-blue-500/30 transition">
                        {card.tag}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-neutral-600 group-hover:text-blue-400 transition">
                      {card.num}
                    </span>
                  </div>

                  {/* Contenu textuel */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 group-hover:text-blue-300 transition">
                      {card.subtitle}
                    </span>
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-blue-400 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Pied de carte avec métrique et flèche */}
                  <div className="relative z-10 pt-4 border-t border-[#1a1a1e] flex items-center justify-between text-xs font-mono text-neutral-500 group-hover:text-neutral-300 transition">
                    <span className="text-[11px] text-blue-400/90 font-medium">{card.metric}</span>
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
