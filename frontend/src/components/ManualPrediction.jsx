import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, Loader2, Sparkles, RotateCcw, Info, ArrowRight } from 'lucide-react';
import { predictSingle } from '../services/api';

const DEFAULT_BENIGN = {
  'Flow Duration': 73752313,
  'Total Fwd Packets': 5,
  'Total Backward Packets': 9,
  'Total Length of Fwd Packets': 11613,
  'Total Length of Bwd Packets': 62,
  'Bwd Packet Length Std': 5.3,
  'Flow Packets/s': 0.19,
  'Flow IAT Mean': 5673254,
  'ACK Flag Count': 1,
};

const DEFAULT_DDOS = {
  'Flow Duration': 248058,
  'Total Fwd Packets': 2,
  'Total Backward Packets': 5,
  'Total Length of Fwd Packets': 20,
  'Total Length of Bwd Packets': 11601,
  'Bwd Packet Length Std': 3022.5,
  'Flow Packets/s': 28.2,
  'Flow IAT Mean': 41343,
  'ACK Flag Count': 0,
};

export default function ManualPrediction({ featuresMetadata }) {
  const [formData, setFormData] = useState(DEFAULT_BENIGN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const featureDescriptions = featuresMetadata?.feature_descriptions || {
    'Flow Duration': 'Durée globale du flux en microsecondes',
    'Total Fwd Packets': 'Nombre total de paquets émis dans le sens aller',
    'Total Backward Packets': 'Nombre total de paquets reçus en retour',
    'Total Length of Fwd Packets': 'Volume total cumulé des octets émis',
    'Total Length of Bwd Packets': 'Volume total cumulé des octets reçus',
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
      {/* Formulaire des 9 features */}
      <div className="lg:col-span-7 bg-black/60 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur">
        <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-zinc-800 gap-3">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">Paramètres du Flux Réseau</h3>
            <p className="text-xs text-zinc-400">Renseignez les 9 métriques du flux pour l'analyse en temps réel (sans Destination Port)</p>
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
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Attaque DDoS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData(DEFAULT_BENIGN);
                setResult(null);
                setError(null);
              }}
              title="Réinitialiser"
              className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureKeys.map((key) => {
              const isFlag = key === 'ACK Flag Count';
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`field-${key}`} className="text-xs font-medium text-zinc-300">
                      {key}
                    </label>
                    <span title={featureDescriptions[key]} className="cursor-help text-zinc-600 hover:text-zinc-400">
                      <Info className="w-3 h-3" />
                    </span>
                  </div>

                  {isFlag ? (
                    <select
                      id={`field-${key}`}
                      value={formData[key]}
                      onChange={(e) => handleChange(key, Number(e.target.value))}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value={0}>0 - Drapeau absent</option>
                      <option value={1}>1 - Drapeau présent (ACK)</option>
                    </select>
                  ) : (
                    <input
                      id={`field-${key}`}
                      type="number"
                      step="any"
                      required
                      value={formData[key] ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  )}
                  <p className="text-[10px] text-zinc-500 truncate">{featureDescriptions[key]}</p>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Inférence en cours...</span>
                </>
              ) : (
                <>
                  <span>Classifier le flux</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Carte Résultat */}
      <div className="lg:col-span-5 bg-black/60 border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur relative overflow-hidden">
        <h3 className="text-base font-semibold text-white tracking-tight pb-4 mb-5 border-b border-zinc-800">
          Verdict du Modèle
        </h3>

        {!result && !loading && (
          <div className="py-16 text-center text-zinc-500 space-y-3">
            <Info className="w-8 h-8 mx-auto text-zinc-700" />
            <p className="text-xs">
              Renseignez les 9 métriques et lancez la classification pour afficher le diagnostic.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
            <p className="text-xs text-zinc-400">Évaluation par le modèle en cours...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div
              className={`p-5 rounded-2xl border ${
                result.is_ddos
                  ? 'bg-rose-950/20 border-rose-800/50'
                  : 'bg-emerald-950/20 border-emerald-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-2xl ${
                    result.is_ddos
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {result.is_ddos ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider block ${
                      result.is_ddos ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.is_ddos ? 'Trafic Malveillant Détecté' : 'Trafic Réseau Légitime'}
                  </span>
                  <h4 className="text-xl font-bold text-white mt-0.5">{result.prediction}</h4>
                </div>
              </div>

              {result.probability != null && (
                <div className="mt-5 space-y-2 pt-4 border-t border-zinc-800/60">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Probabilité d'attaque DDoS :</span>
                    <span className="font-mono font-bold text-white">
                      {(result.probability * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.is_ddos ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${result.probability * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
              <div className="flex justify-between">
                <span className="text-zinc-500">Niveau de certitude :</span>
                <span className="font-mono text-zinc-300 font-medium">{result.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Modèle exécuté :</span>
                <span className="font-mono text-blue-400 font-medium">{result.model_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Features évaluées :</span>
                <span className="font-mono text-zinc-300">9 métriques réseau</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
