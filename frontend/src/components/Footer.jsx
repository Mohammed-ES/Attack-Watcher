import { ShieldCheck, GitBranch, ExternalLink } from 'lucide-react';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-800/80 bg-obsidian-950 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-cyan-400 font-bold text-base">&gt;_</span>
              <span className="font-bold text-white text-base tracking-tight font-mono">attack_watcher</span>
            </div>
            <p className="text-slate-400 text-xs font-light max-w-sm leading-relaxed">
              Plateforme de sécurité réseau et d'ingénierie Machine Learning dédiée à l'identification
              et à la neutralisation des attaques par déni de service distribué (DDoS) en temps réel.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-slate-400">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-obsidian-900 border border-slate-800 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modèle Actif : RandomForest (Champion)</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2">
            <h5 className="font-mono text-white uppercase tracking-wider text-xs font-semibold">Navigation</h5>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => scrollTo('hero')} className="hover:text-cyan-400 transition">
                  Présentation
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-cyan-400 transition">
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('console')} className="hover:text-cyan-400 transition">
                  Console Active
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('benchmark')} className="hover:text-cyan-400 transition">
                  Benchmark ML
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-cyan-400 transition">
                  Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Références & Liens */}
          <div className="space-y-2">
            <h5 className="font-mono text-white uppercase tracking-wider text-xs font-semibold">Références & Sources</h5>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.unb.ca/cic/datasets/ids-2017.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition flex items-center space-x-1"
                >
                  <span>CIC-IDS2017 Dataset</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition flex items-center space-x-1"
                >
                  <GitBranch className="w-3 h-3 text-cyan-400" />
                  <span>Dépôt GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Mohammed-ES/Attack-Watcher/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition"
                >
                  Licence MIT
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne inférieure de copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>Copyright (c) 2026 Mohammed-ES. Tous droits réservés.</span>
          <span>Développé pour la détection DDoS en production sur standard CIC-IDS2017.</span>
        </div>
      </div>
    </footer>
  );
}
