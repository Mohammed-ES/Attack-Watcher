import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Filter, Cpu, Zap, Check, ArrowRight, Activity, Database, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '../animations';

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
      telemetry: {
        stage: 'Ingestion & Nettoyage',
        statLabel: 'Taux de conformité',
        statValue: '100.0%',
        detail: 'Toutes les lignes brutes normalisées et validées',
        target: 'CIC-IDS2017 Ingestion Pipeline',
      },
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
      telemetry: {
        stage: 'Validation Anti-Fuite',
        statLabel: 'Isolation Statistique',
        statValue: '100% Strict',
        detail: 'StandardScaler ajusté uniquement sur X_train',
        target: 'Train 80% / Test 20% Stratified',
      },
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
      telemetry: {
        stage: 'Sélection Modèle Champion',
        statLabel: 'Score F1 Champion',
        statValue: '1.000',
        detail: 'RandomForest sélectionné avec précision parfaite',
        target: 'Cross-validated vs XGBoost',
      },
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
      telemetry: {
        stage: 'Moteur d’Inférence Async',
        statLabel: 'Latence Médiane',
        statValue: '< 0.05 ms',
        detail: 'Traitement vectorisé instantané des flux réseau',
        target: 'FastAPI Async Worker Core',
      },
    },
  ];

  const activeData = steps[activeStep];
  const ActiveIcon = activeData.icon;

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-black/60 border-t border-[#1a1a1e] relative backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré épuré */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              How it works
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Precision telemetry, automated sanitization, and supervised machine learning inference
              across every layer of your network.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-neutral-300 border border-[#222228]">
                Architecture Pipeline
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Bloc interactif deux côtés avec scroll motion */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Côté Gauche (7 colonnes) : Cartes interactives animées */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    layout
                    onClick={() => setActiveStep(idx)}
                    whileHover={{ y: -2, scale: 1.008 }}
                    transition={{ duration: 0.3 }}
                    className={`cursor-pointer rounded-2xl transition-all duration-300 relative overflow-hidden border p-5 sm:p-6 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 border-blue-400/50 shadow-2xl shadow-blue-600/30 text-white'
                        : 'bg-[#0c0c0e]/80 hover:bg-[#121216] border-[#1a1a1e] hover:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    {/* Lueur d'accent active */}
                    {isActive && (
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3.5">
                        <span
                          className={`font-mono text-xl sm:text-2xl font-bold ${
                            isActive ? 'text-white' : 'text-neutral-500'
                          }`}
                        >
                          {step.id}
                        </span>
                        <div
                          className={`p-2 rounded-xl ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-black border border-[#1a1a1e] text-neutral-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-mono uppercase tracking-wider block ${
                              isActive ? 'text-blue-100' : 'text-neutral-500'
                            }`}
                          >
                            {step.subtitle}
                          </span>
                          <h3
                            className={`text-base sm:text-lg font-semibold tracking-tight ${
                              isActive ? 'text-white' : 'text-neutral-200'
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-black border-[#1a1a1e] text-neutral-400'
                          }`}
                        >
                          {step.badge}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                            isActive ? 'rotate-90 text-white' : 'text-neutral-600'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Contenu détaillé déplié de la carte active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="pt-4 mt-4 border-t border-white/15 space-y-3"
                        >
                          <p className="text-blue-50 text-xs sm:text-sm font-light leading-relaxed">
                            {step.desc}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                            <div className="flex items-center space-x-2 bg-black/25 rounded-lg px-3 py-2 border border-white/10">
                              <Check className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
                              <span className="text-white text-[11px]">{step.detail1}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-black/25 rounded-lg px-3 py-2 border border-white/10">
                              <Check className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
                              <span className="text-white text-[11px]">{step.detail2}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Côté Droit (5 colonnes) : Carte Architecture synchronisée dynamiquement */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-[#0c0c0e]/90 border border-[#1a1a1e] p-7 sm:p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
              {/* Lueur d'ambiance bleue réactive */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-neutral-400 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="uppercase tracking-wider">Pipeline Stage Monitor</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">
                    CIC-IDS2017
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Télémétrie & Validation Pipeline
                  </h3>
                  <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed">
                    Inspection en direct des étapes d'ingestion, d'assainissement et d'inférence vectorielle du moteur supervisé.
                  </p>
                </div>

                {/* Panneau télémétrique réactif selon l'étape sélectionnée */}
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 rounded-2xl bg-black/80 border border-blue-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                    <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs">
                      <ActiveIcon className="w-4 h-4" />
                      <span>{activeData.telemetry.stage}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">
                      ÉTAPE {activeData.id}/04
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-neutral-400">
                      {activeData.telemetry.statLabel}
                    </span>
                    <span className="text-2xl font-bold font-mono text-white">
                      {activeData.telemetry.statValue}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 font-mono">
                    {activeData.telemetry.detail}
                  </p>
                </motion.div>
              </div>

              {/* Matrice de statut fixe en bas */}
              <div className="relative z-10 mt-6 pt-5 border-t border-[#1a1a1e] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-[#1a1a1e]">
                  <span className="text-neutral-400 flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Jeu d'évaluation</span>
                  </span>
                  <span className="text-white font-semibold">CIC-IDS2017</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-[#1a1a1e]">
                  <span className="text-neutral-400 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Variables en entrée</span>
                  </span>
                  <span className="text-blue-400 font-semibold">10 Features</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black border border-[#1a1a1e]">
                  <span className="text-neutral-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Modèle Champion</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">RandomForest</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
