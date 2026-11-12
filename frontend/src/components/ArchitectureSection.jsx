import { motion } from 'framer-motion';
import { Layers, ShieldCheck, Terminal, Server, FileText, ExternalLink } from 'lucide-react';

export default function ArchitectureSection() {
  const steps = [
    {
      num: '01',
      title: 'Nettoyage & Sécurisation des Données',
      desc: 'Suppression des espaces de colonnes, conversion des valeurs infinies, élimination des doublons et encodage binaire strict (BENIGN=0, DDoS=1).',
      icon: Terminal,
      border: 'border-cyan-800/60',
    },
    {
      num: '02',
      title: 'Split Stratifié sans Fuite (Anti-Leakage)',
      desc: 'Découpage 80/20 avec préservation des proportions de classe AVANT tout ajustement du StandardScaler. Garantit la pureté du test.',
      icon: ShieldCheck,
      border: 'border-violet-800/60',
    },
    {
      num: '03',
      title: 'Service API FastAPI & Validation Pydantic',
      desc: 'Validation stricte des types et plages de valeurs, gestion de cycle de vie asynchrone (lifespan) et normalisation vectorisée en mémoire.',
      icon: Server,
      border: 'border-emerald-800/60',
    },
    {
      num: '04',
      title: 'Interface Client Réactive & Graphiques Recharts',
      desc: 'Application React 19 optimisée avec Vite 8, visualisations vectorielles interactives, pagination instantanée et export sécurisé.',
      icon: Layers,
      border: 'border-amber-800/60',
    },
  ];

  return (
    <section id="architecture" className="py-20 border-t border-slate-800/80 bg-obsidian-950/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            # Conception Logicielle & Pipeline
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Architecture Système & Flux de Données
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 font-light leading-relaxed">
            Un pipeline de bout en bout conçu pour une transparence totale, une haute disponibilité
            et une reproductibilité scientifique absolue.
          </p>
        </div>

        {/* Étapes du pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-6 rounded-xl bg-obsidian-900/60 border ${s.border} backdrop-blur shadow-xl space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-slate-400 font-mono">{s.num}</span>
                  <div className="p-2 rounded-lg bg-obsidian-950 border border-slate-800 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">{s.title}</h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Bloc documentation technique */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-violet-950/40 via-obsidian-900 to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Documentation Technique Complète</h4>
            <p className="text-xs text-slate-400 font-light">
              Consultez le fichier ARCHITECTURE.md pour les schémas détaillés, les formules mathématiques et les sources académiques.
            </p>
          </div>
          <a
            href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-obsidian-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Lire ARCHITECTURE.md</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

