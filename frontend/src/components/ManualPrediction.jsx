import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, Loader2, Sparkles, RotateCcw, Info, ArrowRight } from 'lucide-react';
import { predictSingle } from '../services/api';

const DEFAULT_BENIGN = {
  'Destination Port': 443,
  'Flow Duration': 2500000,
  'Total Fwd Packets': 8,
  'Total Backward Packets': 10,
  'Total Length of Fwd Packets': 1200,
  'Total Length of Bwd Packets': 3500,
  'Bwd Packet Length Std': 145.2,
  'Flow Packets/s': 28.5,
  'Flow IAT Mean': 75000,
  'ACK Flag Count': 1,
};

const DEFAULT_DDOS = {
  'Destination Port': 80,
  'Flow Duration': 1500,
  'Total Fwd Packets': 35,
  'Total Backward Packets': 0,
  'Total Length of Fwd Packets': 2800,
  'Total Length of Bwd Packets': 0,
  'Bwd Packet Length Std': 0.0,
  'Flow Packets/s': 4800,
  'Flow IAT Mean': 8.5,
  'ACK Flag Count': 0,
};

export default function ManualPrediction({ featuresMetadata }) {
  const [formData, setFormData] = useState(DEFAULT_BENIGN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const featureDescriptions = featuresMetadata?.feature_descriptions || {
    'Destination Port': 'Port réseau de destination (ex: 80, 443)',
    'Flow Duration': 'Durée globale du flux en microsecondes',
    'Total Fwd Packets': 'Nombre total de paquets émis',
    'Total Backward Packets': 'Nombre total de paquets reçus',
    'Total Length of Fwd Packets': 'Volume total des octets émis',
    'Total Length of Bwd Packets': 'Volume total des octets reçus',
    'Bwd Packet Length Std': 'Écart-type de la longueur des paquets reçus',
    'Flow Packets/s': 'Débit du flux en paquets par seconde',
    'Flow IAT Mean': 'Temps moyen inter-paquets en microsecondes',
    'ACK Flag Count': 'Drapeau TCP ACK présent (0 ou 1)',
  };

  const featureKeys = Object.keys(DEFAULT_BENIGN);

  const handleChange = (key, val) => {
    const num = parseFloat(val);
    setFormData((prev) => ({
      ...prev,
      [key]: isNaN(num) ? val : num,
    }));
  };

  const loadPreset = (preset) => {
    setFormData(preset);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await predictSingle(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'inférence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Formulaire des 10 features */}
      <div className="lg:col-span-7 bg-black/60 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-zinc-800 gap-3">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Paramètres du Flux Réseau</h3>
            <p className="text-xs text-zinc-400">Renseignez les 10 métriques du flux pour l'analyse en temps réel</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => loadPreset(DEFAULT_BENIGN)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition border border-zinc-800 flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trafic Normal</span>
            </button>

            <button
              type="button"
              onClick={() => loadPreset(DEFAULT_DDOS)}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition border border-zinc-800 flex items-center space-x-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Attaque DDoS</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureKeys.map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">{key}</label>
                  <div className="group relative cursor-help">
                    <Info className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition" />
                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-52 p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px] rounded-xl shadow-2xl z-30 pointer-events-none">
                      {featureDescriptions[key] || key}
                    </div>
                  </div>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData[key] ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setFormData(DEFAULT_BENIGN);
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold tracking-tight shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Inférence en cours...</span>
                </>
              ) : (
                <>
                  <span>Analyser le Flux</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Carte de Résultat */}
      <div className="lg:col-span-5 flex flex-col justify-start">
        <div className="bg-black/60 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur sticky top-24 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">
            Verdict du Modèle
          </span>

          {!result && !loading && (
            <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl">
              <ShieldCheck className="w-10 h-10 mx-auto text-zinc-700 mb-3" />
              <p className="text-sm font-medium text-zinc-400">En attente d'inférence</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                Modifiez les 10 métriques réseau ou chargez un exemple pour lancer la classification.
              </p>
            </div>
          )}

          {loading && (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-xs font-medium text-zinc-300">Classification en cours...</p>
            </div>
          )}

          {result && !loading && (
            <div
              className={`rounded-2xl p-6 border transition-all ${
                result.is_ddos
                  ? 'bg-rose-950/20 border-rose-600/60 shadow-xl shadow-rose-950/40'
                  : 'bg-emerald-950/20 border-emerald-600/60 shadow-xl shadow-emerald-950/40'
              }`}
            >
              <div className="flex items-center space-x-3 mb-5">
                <div
                  className={`p-3 rounded-xl border ${
                    result.is_ddos
                      ? 'bg-rose-950 border-rose-700 text-rose-400'
                      : 'bg-emerald-950 border-emerald-700 text-emerald-400'
                  }`}
                >
                  {result.is_ddos ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                </div>

                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold ${
                      result.is_ddos
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700'
                        : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                    }`}
                  >
                    Verdict
                  </span>
                  <h4
                    className={`text-2xl font-bold tracking-tight mt-0.5 ${
                      result.is_ddos ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.prediction}
                  </h4>
                </div>
              </div>

              {/* Jauge de probabilité */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Probabilité d'attaque DDoS</span>
                  <span className={`font-mono font-bold ${result.is_ddos ? 'text-rose-400' : 'text-zinc-300'}`}>
                    {(result.probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      result.is_ddos ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(result.probability * 100, 2)}%` }}
                  ></div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-4 border-t border-zinc-800/80">
                <div className="bg-black/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-zinc-500 text-[10px] uppercase block mb-0.5">Certitude</span>
                  <span className="text-white font-semibold text-sm">{result.confidence.toFixed(1)}%</span>
                </div>

                <div className="bg-black/60 border border-zinc-800 p-3 rounded-xl">
                  <span className="text-zinc-500 text-[10px] uppercase block mb-0.5">Modèle</span>
                  <span className="text-white font-semibold text-sm">{result.model_name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
