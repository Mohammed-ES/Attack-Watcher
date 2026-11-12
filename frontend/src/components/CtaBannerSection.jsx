import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export default function CtaBannerSection({ onLaunchConsole }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 sm:py-28 bg-black border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-zinc-800 shadow-2xl"
        >
          {/* Côté Gauche Sombre (8 colonnes) */}
          <div className="lg:col-span-7 bg-zinc-950 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                <Terminal className="w-4 h-4 text-blue-400" />
              </div>

              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Ready to scale your defense?
              </h3>

              <p className="text-zinc-400 text-xs sm:text-sm font-light max-w-md leading-relaxed">
                Déployez notre moteur de détection DDoS supervisé dès aujourd'hui ou testez vos fichiers
                de capture directement dans la console interactive.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (onLaunchConsole) onLaunchConsole();
                  scrollTo('console');
                }}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold tracking-tight transition active:scale-95 flex items-center space-x-2"
              >
                <span>Lancer la Détection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="https://github.com/Mohammed-ES/Attack-Watcher"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium tracking-tight transition"
              >
                Explorer sur GitHub
              </a>
            </div>
          </div>

          {/* Côté Droit Bleu Électrique Vibrant (5 colonnes) */}
          <div className="lg:col-span-5 bg-blue-600 p-8 sm:p-12 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Lueur subtile */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-2xl font-bold tracking-tight mb-2">
                  Security Operations
                </h4>
                <p className="text-blue-100 text-xs font-light leading-relaxed">
                  Pipelines d'alertes automatisées, télémétrie en temps réel et intégration continue
                  pour la protection des infrastructures cloud et télécoms.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs font-mono text-blue-200 relative z-10">
              <span>Standard CIC-IDS2017</span>
              <span className="text-white font-semibold">99.99% F1-Score</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
