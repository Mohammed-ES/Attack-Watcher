import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function TiersSection({ onSelectTier }) {
  const tiers = [
    {
      name: 'Community',
      tagline: 'Pour la recherche et les expérimentations locales.',
      price: 'Free',
      period: 'Open Source',
      highlighted: false,
      features: [
        'Modèles RandomForest & XGBoost sérialisés',
        'Pipeline train.py anti-fuite de données',
        'Saisie manuelle des 10 features réseau',
        'Générateur d’échantillons synthétiques',
        'Code source complet sous licence MIT',
      ],
      buttonText: 'Consulter sur GitHub',
      buttonLink: 'https://github.com/Mohammed-ES/Attack-Watcher',
      buttonStyle: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800',
    },
    {
      name: 'Production API',
      tagline: 'Pour les équipes SecOps et services de production.',
      price: 'Standard',
      period: 'Prêt à l’emploi',
      highlighted: true,
      features: [
        'Inférence REST FastAPI asynchrone (<0.05ms)',
        'Validation stricte des types Pydantic v2',
        'Traitement par lot de captures CSV massives',
        'Génération et téléchargement de CSV annotés',
        'Visualisations interactives Recharts 3',
        'Pipeline GitHub Actions CI automatisé',
      ],
      buttonText: 'Lancer la Console',
      buttonAction: onSelectTier,
      buttonStyle: 'bg-white hover:bg-zinc-200 text-black font-semibold shadow-lg shadow-white/10',
    },
    {
      name: 'Enterprise Cluster',
      tagline: 'Pour les opérateurs télécoms et infrastructures critiques.',
      price: 'Custom',
      period: 'Sur mesure',
      highlighted: false,
      features: [
        'Déploiement distribué multi-nœuds haute cadence',
        'Connecteurs directs SIEM (Splunk, Elastic, Sentinel)',
        'Ré-entraînement continu sur vos logs privés',
        'Accompagnement ingénierie et support 24/7',
        'Garantie de disponibilité SLA 99.99%',
      ],
      buttonText: 'Contacter l’Équipe',
      buttonLink: 'mailto:contact@attackwatcher.local',
      buttonStyle: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800',
    },
  ];

  return (
    <section id="integration" className="py-24 sm:py-32 bg-black border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Predictable architecture at scale
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-normal">
            Modular deployment options designed to fit seamlessly from local development to production telemetry.
          </p>
        </div>

        {/* 3 Cartes (Exactement le layout du screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                t.highlighted
                  ? 'bg-zinc-950/90 border-2 border-blue-500/50 shadow-2xl shadow-blue-600/20 relative'
                  : 'bg-zinc-950/60 border border-zinc-900'
              }`}
            >
              {t.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-semibold uppercase tracking-wider">
                  Recommandé
                </div>
              )}

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {t.name}
                </span>

                <div className="mt-4 mb-2 flex items-baseline space-x-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {t.price}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/ {t.period}</span>
                </div>

                <p className="text-xs text-zinc-400 font-light mb-6">
                  {t.tagline}
                </p>

                {/* Liste des fonctionnalités */}
                <div className="space-y-3 pt-4 border-t border-zinc-900 text-xs">
                  {t.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-2 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="font-light">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton en bas */}
              <div className="pt-8 mt-6 border-t border-zinc-900">
                {t.buttonAction ? (
                  <button
                    onClick={t.buttonAction}
                    className={`w-full py-2.5 rounded-full text-xs transition duration-200 block text-center active:scale-95 ${t.buttonStyle}`}
                  >
                    {t.buttonText}
                  </button>
                ) : (
                  <a
                    href={t.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 rounded-full text-xs transition duration-200 block text-center active:scale-95 ${t.buttonStyle}`}
                  >
                    {t.buttonText}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
