import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Filter, Cpu, Zap, Check } from 'lucide-react';

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: '01',
      title: 'Nettoyage & Filtrage',
      subtitle: 'Data Sanitization',
      desc: 'Suppression des espaces parasites, remplacement vectorisé des inf/NaN, élimination des doublons et encodage binaire strict (BENIGN=0, DDoS=1).',
      tag: 'CIC-IDS2017 Dataset',
      icon: Filter,
      badge: 'Zéro bruit',
      detail1: '10 features réseau extraites',
      detail2: 'NaN & inf éliminés',
    },
    {
      id: '02',
      title: 'Split Stratifié sans Fuite',
      subtitle: 'Anti-Leakage Split',
      desc: 'Partition 80% train / 20% test avec conservation exacte du ratio de classes, appliquée AVANT l’ajustement du StandardScaler pour éliminer toute fuite.',
      tag: 'StratifiedShuffleSplit',
      icon: ShieldCheck,
      badge: 'Isolation 100%',
      detail1: 'StandardScaler fitté sur Train',
      detail2: 'Aucune fuite vers Test',
    },
    {
      id: '03',
      title: 'Benchmark RF & XGBoost',
      subtitle: 'Dual Engine Selection',
      desc: 'Entraînement simultané de RandomForest et XGBoost, évaluation par matrice de confusion et sélection dynamique du modèle champion selon le F1-score.',
      tag: 'Champion Sélectionné',
      icon: Cpu,
      badge: 'F1-Score 100%',
      detail1: 'RandomForest (Champion)',
      detail2: 'XGBoost (Comparatif)',
    },
    {
      id: '04',
      title: 'Inférence REST Microseconde',
      subtitle: 'Production API',
      desc: 'Exposition asynchrone FastAPI avec validation Pydantic v2. Inférence unitaire instantanée ou traitement de captures CSV massives par lot.',
      tag: 'FastAPI + Pydantic v2',
      icon: Zap,
      badge: '< 0.05ms',
      detail1: 'Routes /predict & /predict-csv',
      detail2: 'Export CSV annoté',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-black border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré épuré */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            How it works
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-normal">
            Precision telemetry, automated sanitization, and supervised machine learning inference
            across every layer of your network.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
              Architecture
            </span>
          </div>
        </div>

        {/* Le bloc interactif 4 colonnes + Panneau latéral (Exactement le layout du screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Colonnes interactives 01, 02, 03, 04 */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-4 gap-3 min-h-[460px]">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? 'sm:col-span-4 lg:col-span-4 bg-blue-600 text-white p-7 shadow-2xl shadow-blue-600/30'
                      : 'hidden sm:flex bg-zinc-950/80 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-800 p-5 text-zinc-400'
                  }`}
                >
                  {/* Vue Active (Carte Bleue Royale étalée) */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      {/* Numéro et titre en haut */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl sm:text-5xl font-bold tracking-tighter opacity-90">
                            {step.id}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                            {step.badge}
                          </span>
                        </div>

                        <span className="text-xs font-mono tracking-wider uppercase text-blue-200 block mb-1">
                          {step.subtitle}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-blue-100/90 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg font-normal">
                          {step.desc}
                        </p>
                      </div>

                      {/* Aperçu architectural illustré intégré dans la carte bleue */}
                      <div className="rounded-xl bg-black/30 border border-white/15 p-4 backdrop-blur-md space-y-2 font-mono text-xs">
                        <div className="flex items-center justify-between text-blue-200 text-[11px] pb-2 border-b border-white/10">
                          <span className="flex items-center space-x-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            <span>{step.tag}</span>
                          </span>
                          <span className="text-white font-semibold">Statut: Validé</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="flex items-center space-x-1.5 text-white">
                            <Check className="w-3 h-3 text-blue-300" />
                            <span>{step.detail1}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-white">
                            <Check className="w-3 h-3 text-blue-300" />
                            <span>{step.detail2}</span>
                          </div>
                        </div>
                      </div>

                      {/* Indicateurs d'étapes en bas */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs text-blue-200 font-mono">
                        <div className="flex space-x-2">
                          {steps.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStep(dotIdx);
                              }}
                              className={`h-1.5 rounded-full transition-all ${
                                dotIdx === activeStep ? 'w-6 bg-white' : 'w-2 bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                        <span>Étape {activeStep + 1} sur 4</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Vue Inactive (Colonne sombre verticale avec numéro 02, 03, 04) */}
                  {!isActive && (
                    <div className="h-full flex flex-col justify-between">
                      <span className="text-2xl font-bold font-mono text-zinc-500">
                        {step.id}
                      </span>
                      <div className="pt-20">
                        <span className="text-xs font-semibold text-zinc-300 block">
                          {step.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                          {step.subtitle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sélecteur mobile d'étape */}
          <div className="sm:hidden flex space-x-2 justify-center py-2">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono ${
                  activeStep === idx
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Carte latérale droite : "Scalable intelligence architecture for modern enterprise" */}
          <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-7 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                Entreprise Grade ML
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                Scalable intelligence architecture for modern enterprise
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
                Notre architecture découple rigoureusement la phase d'apprentissage statistique
                de l'exécution d'inférence en production. Les artefacts sérialisés garantissent une
                défense pérenne, sans re-calculs superflus.
              </p>
            </div>

            {/* Matrice de statut dynamique */}
            <div className="mt-8 pt-6 border-t border-zinc-900 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-800">
                <span className="text-zinc-400">Jeu d'évaluation</span>
                <span className="text-white font-semibold">CIC-IDS2017 Friday</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-800">
                <span className="text-zinc-400">Variables en entrée</span>
                <span className="text-blue-400 font-semibold">10 Features Standard</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-zinc-800">
                <span className="text-zinc-400">Modèle Champion</span>
                <span className="text-emerald-400 font-semibold">RandomForest (100% F1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
