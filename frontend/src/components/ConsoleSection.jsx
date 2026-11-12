import { useState } from 'react';
import { Sliders, FileSpreadsheet, Activity } from 'lucide-react';
import ManualPrediction from './ManualPrediction';
import CsvPrediction from './CsvPrediction';

export default function ConsoleSection({ featuresMetadata }) {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <section id="console" className="py-24 sm:py-32 bg-black border-t border-zinc-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* En-tête centré épuré */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-blue-400 border border-zinc-800">
            <Activity className="w-3.5 h-3.5" />
            <span>Moteur d'Inférence Actif</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Live Detection Console
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-normal">
            Testez directement le modèle champion sur 10 métriques réseau ou téléversez vos fichiers CSV.
          </p>

          {/* Commutateur en pilule moderne (Aura Style) */}
          <div className="pt-4 flex justify-center">
            <div className="p-1 rounded-full bg-zinc-950 border border-zinc-800 inline-flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-semibold transition ${
                  activeTab === 'manual'
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Saisie Manuelle (10 Features)</span>
              </button>

              <button
                onClick={() => setActiveTab('csv')}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-semibold transition ${
                  activeTab === 'csv'
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Analyse par Fichier CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Corps de la console */}
        <div className="rounded-2xl bg-zinc-950/70 border border-zinc-900 p-6 sm:p-8 backdrop-blur shadow-2xl">
          {activeTab === 'manual' ? (
            <ManualPrediction featuresMetadata={featuresMetadata} />
          ) : (
            <CsvPrediction />
          )}
        </div>
      </div>
    </section>
  );
}
