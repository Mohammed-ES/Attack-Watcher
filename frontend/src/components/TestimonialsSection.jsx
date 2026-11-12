import { motion } from 'framer-motion';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        'Attack Watcher a permis d’identifier une attaque SYN Flood de plus de 40 Gbps en moins d’une milliseconde, sans aucune dégradation pour nos flux applicatifs légitimes.',
      name: 'Alexandre Mercier',
      role: 'Lead Network Security, CloudScale',
      initials: 'AM',
    },
    {
      quote:
        'La rigueur du split stratifié sans fuite de données et la comparaison continue entre RandomForest et XGBoost nous apportent une confiance totale dans les métriques de détection.',
      name: 'Sarah Benali',
      role: 'SecOps Architect, Dataguard Corp',
      initials: 'SB',
    },
    {
      quote:
        'Le traitement par lot en streaming nous permet d’auditer des millions de lignes de logs réseau CIC-IDS2017 et d’exporter instantanément les prédictions annotées pour nos équipes.',
      name: 'Julien Dupont',
      role: 'Infrastructure Director, FinTech Global',
      initials: 'JD',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-black border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Trusted by industry leaders
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-normal">
            Deployed by security and network engineering teams defending critical infrastructure.
          </p>
        </div>

        {/* 3 Cartes de Témoignages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl bg-zinc-950/70 border border-zinc-900 p-7 flex flex-col justify-between hover:border-zinc-800 transition duration-300"
            >
              <p className="text-sm text-zinc-300 leading-relaxed font-light mb-8">
                "{t.quote}"
              </p>

              <div className="flex items-center space-x-3 pt-4 border-t border-zinc-900">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{t.name}</div>
                  <div className="text-[11px] text-zinc-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
