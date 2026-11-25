import { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getHealth, getModelInfo } from '../services/api';

export default function Footer() {
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: 'degraded' }));
    getModelInfo().then(setModelInfo).catch(() => null);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const isHealthy = health?.status === 'healthy';
  const version = modelInfo?.version ?? '—';

  return (
    <footer className="bg-black border-t border-[#1a1a1e] py-16 text-neutral-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center shadow-md">
                <img
                  src="/color-icon.webp"
                  alt="Attack Watcher Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-sm tracking-tight">Attack Watcher</span>
            </div>

            <p className="text-neutral-500 text-xs font-light max-w-sm leading-relaxed">
              Prototype de détection DDoS par Random Forest, sur fichiers CSV CIC-IDS2017 et CIC-DDoS2019.
            </p>

            <div className="pt-1 flex items-center space-x-2 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-neutral-400">
                {isHealthy ? 'Système Opérationnel' : 'Système Dégradé'} | Version {version}
              </span>
            </div>
          </div>

          {/* Colonne Plateforme */}
          <div className="space-y-3">
            <h5 className="font-medium text-white text-xs">Plateforme</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition">
                  Fonctionnement
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('model-info')} className="hover:text-white transition">
                  Pipeline & Modèles
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('console')} className="hover:text-white transition">
                  Console
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('verify-tp')} className="hover:text-white transition">
                  Vérifier mon TP
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="hover:text-white transition">
                  Questions / FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne Ressources */}
          <div className="space-y-3">
            <h5 className="font-medium text-white text-xs">Ressources</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/ARCHITECTURE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <span>Spécification Architecture</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.unb.ca/cic/datasets/ids-2017.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <span>Dataset CIC-IDS2017</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
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
                  <ArrowUpRight className="w-3 h-3 text-neutral-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne inférieure de copyright */}
        <div className="pt-8 border-t border-[#1a1a1e] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono">
          <div>
            © 2026 Attack Watcher. Détection DDoS par machine learning. Prototype de recherche.
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-neutral-500">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
