import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '../animations';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Comment la séparation entraînement / test est-elle assurée ?",
      answer:
        "Entraînement sur CIC-IDS2017 et une partie de CIC-DDoS2019, test sur des attaques réservées et du Normal réservé, imputation apprise sur l'entraînement uniquement.",
    },
    {
      question: 'Quel est le modèle déployé et comment a-t-il été évalué ?',
      answer:
        "Le système utilise un RandomForestClassifier scikit-learn 1.6.1 au sein d'une Pipeline avec SimpleImputer. Il a été entraîné sur des sous-ensembles de CIC-IDS2017 et CIC-DDoS2019, et évalué sur un jeu de test externe réservé comprenant des attaques réservées (TFTP, UDPLag, DrDoS_LDAP) et du trafic normal réservé.",
    },
    {
      question: "Quelles sont les 9 caractéristiques réseau extraites pour l'inférence ?",
      answer:
        "Le vecteur d'entrée capture la signature dynamique des flux TCP/IP : Flow Duration, Total Fwd Packets, Total Backward Packets, Total Length of Fwd Packets, Total Length of Bwd Packets, Bwd Packet Length Std, Flow Packets/s, Flow IAT Mean et ACK Flag Count. La variable Destination Port a été retirée pour éviter tout biais lié au contexte de capture.",
    },
    {
      question: "Quelles sont les limites de taille des fichiers ?",
      answer:
        "50 Mo maximum (erreur 413 au-delà), colonnes obligatoires contrôlées (erreur 422).",
    },
    {
      question: 'Comment exporter les résultats annotés vers les plateformes SIEM / SOC ?',
      answer:
        "Après chaque analyse par lot, l'utilisateur peut télécharger un fichier CSV annoté avec les colonnes Attack_Watcher_Prediction et DDoS_Probability (score du modèle), sans intégration directe avec Splunk, Elastic ou Graylog.",
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
              Foire aux questions
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Éclairages techniques sur la pipeline de machine learning, les jeux de données d'évaluation et le prototype de détection.
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
                    <span className="text-sm sm:text-base font-semibold text-white tracking-tight flex-1">
                      {faq.question}
                    </span>

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

