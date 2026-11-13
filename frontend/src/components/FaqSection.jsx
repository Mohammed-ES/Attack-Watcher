import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '../animations';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "Comment l'architecture élimine-t-elle tout risque de fuite de données (Data Leakage) ?",
      answer:
        "La partition des données (StratifiedShuffleSplit 80% entraînement / 20% test) est appliquée strictement avant toute étape de mise à l'échelle. L'objet StandardScaler est fitté exclusivement sur le sous-ensemble d'apprentissage (X_train) puis sérialisé, garantissant que les données de test ne contaminent jamais les paramètres de normalisation.",
      tag: 'Anti-Leakage',
    },
    {
      question: 'Pourquoi le modèle Random Forest a-t-il été retenu comme champion face à XGBoost ?',
      answer:
        "Lors de notre banc d'essai comparatif sur le sous-ensemble standard CIC-IDS2017, RandomForest a atteint un score F1 optimal de 1.000 avec une matrice de confusion sans faux positifs sur les flux DDoS. De plus, il offre un temps d'exécution unitaire inférieur (< 0.05 ms par vecteur) et une empreinte mémoire compacte en production.",
      tag: 'Dual Benchmark',
    },
    {
      question: "Quelles sont les 10 caractéristiques réseau extraites pour l'inférence ?",
      answer:
        "Le vecteur d'entrée capture la signature dynamique des flux TCP/IP : Destination Port, Flow Duration, Total Fwd/Bwd Packets, Total Length of Fwd/Bwd Packets, Fwd Packet Length Max/Mean, et Flow IAT Mean/Std. Ces variables permettent d'identifier instantanément les anomalies de débit et les inondations.",
      tag: 'Features Réseau',
    },
    {
      question: "Comment le traitement vectorisé de fichiers CSV massifs s'effectue-t-il sans saturation mémoire ?",
      answer:
        "Le point d'accès /predict-csv utilise un streaming vectorisé avec Pandas et NumPy. Les 10 colonnes requises sont filtrées, assainies (nettoyage des NaN et valeurs infinies) et transformées par lot directement en tenseurs NumPy, permettant de classifier plusieurs centaines de milliers de lignes en quelques secondes sans saturer la RAM.",
      tag: 'Batch Inspection',
    },
    {
      question: "Quelle est la latence d'inférence garantie en environnement de production ?",
      answer:
        "L'exposition via FastAPI et Pydantic v2 garantit une validation de schéma à haute cadence. Le temps de réponse médian pour une requête unitaire sur /predict est inférieur à 0.05 milliseconde, rendant l'outil apte à une intégration directe sur des sondes réseau en coupure ou en écoute passive.",
      tag: 'Performance SLA',
    },
    {
      question: 'Comment exporter les résultats annotés vers les plateformes SIEM / SOC ?',
      answer:
        "Après chaque analyse par lot, l'utilisateur dispose d'un bouton de téléchargement instantané renvoyant le fichier CSV enrichi de deux colonnes techniques : 'Prediction' (BENIGN ou DDoS) et 'DDoS_Probability' (confiance probabiliste entre 0 et 1), directement intégrable dans Splunk, Elastic ou Graylog.",
      tag: 'Export SIEM',
    },
  ];

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 sm:py-36 bg-black/80 border-t border-[#1a1a1e] relative backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête centré épuré */}
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Architecture & Fonctionnement</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Questions, answered
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Technical insights into our machine learning pipeline, dataset certification, and real-time DDoS mitigation engine.
            </p>
          </div>
        </ScrollReveal>

        {/* Liste accordéon moderne */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={0.05 * (idx + 1)}
              >
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#0c0c0e] border-blue-500/50 shadow-xl shadow-blue-900/10'
                      : 'bg-[#0c0c0e]/80 border-[#1a1a1e] hover:border-neutral-700'
                  }`}
                >
                  {/* Bouton de l'accordéon */}
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-5 px-6 sm:px-7 text-left flex items-center justify-between space-x-4 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5 flex-1">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black border border-[#1a1a1e] text-blue-400 flex-shrink-0 hidden sm:inline-block">
                        {faq.tag}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                        isOpen
                          ? 'bg-blue-600 border-blue-500 text-white rotate-180'
                          : 'bg-black border-[#1a1a1e] text-neutral-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Contenu dépliable */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 sm:px-7 text-neutral-300 text-xs sm:text-sm font-light leading-relaxed border-t border-[#1a1a1e]/60 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
