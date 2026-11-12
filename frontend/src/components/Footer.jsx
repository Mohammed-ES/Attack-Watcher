import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-zinc-900 py-16 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm tracking-tight">Attack Watcher</span>
            </div>

            <p className="text-zinc-500 text-xs font-light max-w-sm leading-relaxed">
              Architecture d'apprentissage automatique supervisé pour l'inspection et la classification
              des flux réseau à haut débit. Modèles RandomForest & XGBoost entraînés sur CIC-IDS2017.
            </p>

            <div className="pt-1 flex items-center space-x-2 text-[11px] text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Système Opérationnel | API FastAPI v1.0.0</span>
            </div>
          </div>

          {/* Colonne Plateforme */}
          <div className="space-y-3">
            <h5 className="font-medium text-white text-xs">Plateforme</h5>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition">
                  Fonctionnement
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('capabilities')} className="hover:text-white transition">
                  Capacités
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('console')} className="hover:text-white transition">
                  Console Live
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('metrics')} className="hover:text-white transition">
                  Métriques & Stats
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne Ressources */}
          <div className="space-y-3">
            <h5 className="font-medium text-white text-xs">Ressources</h5>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a
                  href="https://www.unb.ca/cic/datasets/ids-2017.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <span>CIC-IDS2017</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <span>Dépôt GitHub</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Architecture ML
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne Légal */}
          <div className="space-y-3">
            <h5 className="font-medium text-white text-xs">Légal</h5>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Licence MIT
                </a>
              </li>
              <li className="text-zinc-600">
                Mohammed-ES &copy; 2026
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne inférieure copyright */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-600 font-mono">
          <span>&copy; 2026 Attack Watcher. Tous droits réservés.</span>
          <span>Développé pour la détection DDoS en production.</span>
        </div>
      </div>
    </footer>
  );
}
