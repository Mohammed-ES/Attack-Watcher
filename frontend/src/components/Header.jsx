import { ShieldCheck, Cpu, Sliders, FileSpreadsheet } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, health, championModel }) {
  const isHealthy = health?.status === 'healthy';

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Titre */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Attack Watcher</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                  ML DDoS Defender
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Surveillance et détection d'attaques réseau par apprentissage supervisé
              </p>
            </div>
          </div>

          {/* Indicateurs de statut */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-md">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Modèle:</span>
              <span className="font-medium text-slate-200">{championModel || 'RandomForest'}</span>
            </div>

            <div className="flex items-center space-x-2 text-xs bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-md">
              <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 ring-2 ring-emerald-950' : 'bg-amber-400 ring-2 ring-amber-950'}`}></span>
              <span className="text-slate-300">{isHealthy ? 'API Opérationnelle' : 'Initialisation...'}</span>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-2 pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Saisie Manuelle</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Analyse par Fichier CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}

