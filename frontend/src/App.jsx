import { useState, useEffect } from 'react';
import Header from './components/Header';
import ManualPrediction from './components/ManualPrediction';
import CsvPrediction from './components/CsvPrediction';
import { getHealth, getFeaturesMetadata } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('manual');
  const [health, setHealth] = useState(null);
  const [featuresMetadata, setFeaturesMetadata] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const [healthRes, featRes] = await Promise.all([
          getHealth().catch(() => null),
          getFeaturesMetadata().catch(() => null),
        ]);
        setHealth(healthRes);
        setFeaturesMetadata(featRes);
      } catch (e) {
        console.error('Erreur initialisation frontend:', e);
      }
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        championModel={featuresMetadata?.champion_model || health?.champion_model}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'manual' ? (
          <ManualPrediction featuresMetadata={featuresMetadata} />
        ) : (
          <CsvPrediction />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Attack Watcher - Système de Protection et Détection d'Attaques DDoS par IA</span>
          <span>Dataset CIC-IDS2017 - Développé sous licence MIT</span>
        </div>
      </footer>
    </div>
  );
}

