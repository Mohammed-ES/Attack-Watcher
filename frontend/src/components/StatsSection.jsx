import { motion } from 'framer-motion';

export default function StatsSection() {
  const stats = [
    {
      value: '99.99%',
      label: 'Précision de Détection',
      desc: 'Mesurée sur le jeu de test indépendant CIC-IDS2017.',
    },
    {
      value: '100k+',
      label: 'Flux par Seconde',
      desc: 'Capacité de traitement vectorisé sans latence.',
    },
    {
      value: '< 0.05ms',
      label: 'Latence d’Inférence',
      desc: 'Réponse microseconde pour blocage immédiat.',
    },
    {
      value: 'Zero',
      label: 'Fuite de Données',
      desc: 'Split stratifié strict appliqué avant tout scaling.',
    },
  ];

  return (
    <section id="metrics" className="py-16 bg-black border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-zinc-950/80 border border-zinc-900 p-8 sm:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-zinc-900"
        >
          {stats.map((s, idx) => (
            <div key={idx} className={`${idx !== 0 ? 'pt-6 sm:pt-0 sm:pl-8' : ''} space-y-1`}>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-sans">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-zinc-300 pt-1 tracking-tight">
                {s.label}
              </div>
              <div className="text-[11px] text-zinc-500 font-normal leading-normal">
                {s.desc}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
