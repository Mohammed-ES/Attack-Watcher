import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ArrowRight, Activity, Cpu, Layers, Sparkles, Terminal, FileSpreadsheet } from 'lucide-react';

export default function HeroSection({ onStartClick, onCsvClick }) {
  return (
    <section id="hero" className="relative pt-12 pb-24 overflow-hidden">
      {/* Halos de lumière radiaux d'arrière-plan */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 glow-blur-purple rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 glow-blur-cyan rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Colonne Gauche : Titres & Appels à l'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Tag de contexte */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-obsidian-900 border border-violet-800/40 text-violet-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
              <span># SecOps Network Intelligence</span>
            </div>

            {/* Titre Principal percutant avec curseur terminal animé */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Inspectez & neutralisez les attaques DDoS en production
              <span className="text-cyan-400 font-mono animate-pulse">_</span>
            </h1>

            {/* Description détaillée */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed">
              Une plateforme de sécurité réseau haute performance propulsée par le Machine Learning.
              Analysez instantanément le flux réseau (10 métriques clés) et détectez les attaques par inondation
              avec un taux de précision supérieur à <strong className="text-white font-semibold">99.9%</strong>.
            </p>

            {/* Boutons d'action */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartClick}
                className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-violet-950/60 flex items-center space-x-2.5 transition"
              >
                <Terminal className="w-4 h-4" />
                <span>Tester la Saisie Manuelle</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCsvClick}
                className="px-6 py-3.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-850 border border-slate-700 text-slate-200 font-medium text-sm flex items-center space-x-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Importer un fichier CSV</span>
              </motion.button>
            </div>

            {/* Bandeau de réassurance / normes industrielles */}
            <div className="pt-8 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-3">
                Standards & Technologies Intégrées
              </span>
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 font-medium">
                <div className="flex items-center space-x-1.5 bg-obsidian-900/60 border border-slate-800 px-2.5 py-1 rounded">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CIC-IDS2017 Dataset</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-obsidian-900/60 border border-slate-800 px-2.5 py-1 rounded">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>FastAPI + Pydantic v2</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-obsidian-900/60 border border-slate-800 px-2.5 py-1 rounded">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scikit-Learn & XGBoost</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-obsidian-900/60 border border-slate-800 px-2.5 py-1 rounded">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>React 19 + Vite 8</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Colonne Droite : Maquette Isométrique Interactive (Inspirée du Screenshot) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Cadre de l'ordinateur portable / console de surveillance */}
            <div className="relative mx-auto rounded-2xl bg-gradient-to-b from-slate-800 to-obsidian-950 p-2.5 shadow-2xl border border-slate-700/80 backdrop-blur">
              {/* Écran de surveillance réseau */}
              <div className="rounded-xl bg-obsidian-950 border border-slate-800 overflow-hidden font-mono text-xs">
                {/* En-tête de fenêtre façon console */}
                <div className="bg-obsidian-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span className="text-slate-400 text-[11px] ml-2">live_inspection.session</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
                    REALTIME ML ENGINE
                  </span>
                </div>

                {/* Contenu visuel simulé en direct */}
                <div className="p-5 space-y-4">
                  {/* Statut d'inondation en direct */}
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 flex items-start space-x-3">
                    <div className="p-1.5 rounded bg-rose-900/60 border border-rose-700 text-rose-400">
                      <ShieldAlert className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-rose-400 font-bold text-xs uppercase tracking-wider">
                          Attaque DDoS Détectée
                        </span>
                        <span className="text-[10px] font-mono text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                          Probabilité 99.9%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 font-sans">
                        Inondation massive détectée sur le Port 80 (Débit 4800 p/s - IAT 8.5μs).
                      </p>
                    </div>
                  </div>

                  {/* Flux normal en parallèle */}
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex items-start space-x-3">
                    <div className="p-1.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-semibold text-xs">
                          Trafic Légitime (Normal)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                          Port 443 | 28 p/s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">
                        Flux chiffré TLS régulier avec réponses aller-retour conformes.
                      </p>
                    </div>
                  </div>

                  {/* Métriques d'inférence en direct */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-obsidian-900 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Latence d'Inférence</span>
                      <span className="text-sm font-bold text-cyan-400">0.03 ms</span>
                    </div>
                    <div className="bg-obsidian-900 p-2.5 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Score F1 Test Set</span>
                      <span className="text-sm font-bold text-violet-400">100.0%</span>
                    </div>
                  </div>
                </div>

                {/* Bas de console */}
                <div className="bg-obsidian-900 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Modèle: Random Forest + XGBoost</span>
                  <span className="text-emerald-400">10 Features Normalisées</span>
                </div>
              </div>
            </div>

            {/* Badges cybernétiques flottants (style du screenshot) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-obsidian-900/90 border border-cyan-500/50 px-3 py-1.5 rounded-lg shadow-xl shadow-cyan-950/40 text-[11px] text-cyan-300 flex items-center space-x-2 backdrop-blur hidden sm:flex"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-mono">Anti-Leakage Split</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-4 bg-obsidian-900/90 border border-violet-500/50 px-3 py-1.5 rounded-lg shadow-xl shadow-violet-950/40 text-[11px] text-violet-300 flex items-center space-x-2 backdrop-blur hidden sm:flex"
            >
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-mono">Inférence Vectorisée</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

