import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Database, Cpu, ArrowUpRight } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      tag: '01 // Temps Réel',
      title: 'Inférence Microseconde',
      desc: 'Classification instantanée du flux réseau à partir des 10 variables fondamentales du trafic IP/TCP avec jauge de probabilité animée.',
      icon: Zap,
      gradient: 'from-cyan-500/20 to-transparent',
      borderColor: 'hover:border-cyan-500/50',
      iconColor: 'text-cyan-400',
    },
    {
      tag: '02 // Traitement par Lot',
      title: 'Analyse Massive de Fichiers CSV',
      desc: 'Téléversement par glisser-déposer de captures volumineuses, synthèse statistique, détection des pics d’attaques et export des données annotées.',
      icon: Database,
      gradient: 'from-violet-500/20 to-transparent',
      borderColor: 'hover:border-violet-500/50',
      iconColor: 'text-violet-400',
    },
    {
      tag: '03 // Rigueur Scientifique',
      title: 'Zéro Fuite de Données',
      desc: 'Le split stratifié est appliqué en amont du StandardScaler. Aucune information du jeu de test ne contamine l’apprentissage du modèle.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500/20 to-transparent',
      borderColor: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
    },
    {
      tag: '04 // Moteur Champion',
      title: 'Double Benchmark RF & XGBoost',
      desc: 'Évaluation comparative continue entre Random Forest et XGBoost sur le dataset de référence CIC-IDS2017 avec matrices de confusion détaillées.',
      icon: Cpu,
      gradient: 'from-amber-500/20 to-transparent',
      borderColor: 'hover:border-amber-500/50',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <section id="features" className="py-20 border-t border-slate-800/80 bg-obsidian-950/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titre de section façon terminal */}
        <div className="max-w-3xl mb-14">
          <div className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            # Architecture & Capacités
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Conçu pour l'inspection réseau en production
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
            Une stack technique pensée pour éliminer les faux positifs, résister aux charges massives
            et fournir aux administrateurs un diagnostic clair et auditable.
          </p>
        </div>

        {/* Grille des 4 cartes avec animation au scroll */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`group relative rounded-xl border border-slate-800 bg-obsidian-900/60 p-6 backdrop-blur transition-all duration-300 ${f.borderColor} hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-950/30 flex flex-col justify-between`}
              >
                {/* Lueur d'arrière-plan au hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${f.gradient} opacity-0 group-hover:opacity-100 rounded-xl transition duration-500 pointer-events-none`}
                ></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                      {f.tag}
                    </span>
                    <div className={`p-2.5 rounded-lg bg-obsidian-950 border border-slate-800 ${f.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-slate-200">
                  <span className="font-mono">Précision 99.9%</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
