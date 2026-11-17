import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Cpu, Award, Sliders, Database, Calendar, AlertTriangle, BarChart3, Grid } from 'lucide-react';
import { getModelInfo, getFeatureImportance } from '../services/api';

export default function BenchmarkSection() {
  const [modelInfo, setModelInfo] = useState(null);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInfo() {
      try {
        setLoading(true);
        const [info, importances] = await Promise.all([
          getModelInfo(),
          getFeatureImportance().catch(() => []),
        ]);
        setModelInfo(info);
        setFeatureImportances(importances);
      } catch (err) {
        setError(err.message || "Impossible de charger les métadonnées du modèle.");
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  if (loading) {
    return (
      <section id="model-info" className="py-20 border-t border-zinc-800 bg-black text-center text-zinc-500 text-xs">
        Chargement des métadonnées du modèle depuis /api/model-info...
      </section>
    );
  }

  if (error || !modelInfo) {
    return (
      <section id="model-info" className="py-20 border-t border-zinc-800 bg-black text-center text-rose-400 text-xs">
        {error || "Les métadonnées du modèle sont actuellement indisponibles."}
      </section>
    );
  }

  const {
    version,
    date_entrainement,
    modele,
    datasets_entrainement = [],
    dataset_test_externe,
    metriques_test_externe = {},
    metriques_test_externe_normal_2017_seul = {},
    limitations = [],
    features = [],
  } = modelInfo;

  const cm = metriques_test_externe.matrice_confusion || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] ?? 0;
  const fp = cm[0]?.[1] ?? 0;
  const fn = cm[1]?.[0] ?? 0;
  const tp = cm[1]?.[1] ?? 0;

  const totalNormal = tn + fp;
  const totalDDoS = fn + tp;
  const tnPct = totalNormal > 0 ? ((tn / totalNormal) * 100).toFixed(2) : '0';
  const fpPct = totalNormal > 0 ? ((fp / totalNormal) * 100).toFixed(2) : '0';
  const fnPct = totalDDoS > 0 ? ((fn / totalDDoS) * 100).toFixed(2) : '0';
  const tpPct = totalDDoS > 0 ? ((tp / totalDDoS) * 100).toFixed(2) : '0';

  return (
    <section id="model-info" className="py-20 border-t border-zinc-800 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Bandeau d'avertissement : Prototype de recherche */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-start space-x-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-amber-400 block">
              Mention Légale : Prototype de Recherche
            </span>
            <p className="text-amber-200/90 leading-relaxed">
              Ce système constitue un prototype de recherche universitaire et expérimentale, non validé pour un déploiement en production industrielle.
            </p>
          </div>
        </div>

        {/* En-tête de section */}
        <div className="max-w-3xl">
          <div className="text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            # Spécifications & Évaluation du Modèle
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Performances sur jeu de test externe
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 font-light leading-relaxed">
            Chaque valeur ci-dessous provient directement de l'évaluation externe sans données simulées.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-mono text-zinc-400">
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
              <span>Version :</span>
              <span className="text-white font-semibold">{version}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Entraînement :</span>
              <span className="text-white font-semibold">{date_entrainement}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Architecture :</span>
              <span className="text-white font-semibold">{modele}</span>
            </span>
          </div>
        </div>

        {/* Datasets d'entraînement et de test externe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-400">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Datasets d'Entraînement</span>
            </div>
            <ul className="text-xs text-zinc-300 space-y-1 font-mono list-disc list-inside">
              {datasets_entrainement.map((ds, i) => (
                <li key={i}>{ds}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-400">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Dataset de Test Externe</span>
            </div>
            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
              {dataset_test_externe}
            </p>
          </div>
        </div>

        {/* Grille principale : Métriques globales et Matrice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 backdrop-blur shadow-xl space-y-6"
          >
            <div className="border-b border-zinc-800 pb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Métriques sur Test Externe</h3>
              <span className="text-xs font-mono text-zinc-400">
                Total Test : {(metriques_test_externe.n_test_normal + metriques_test_externe.n_test_ddos)?.toLocaleString()} flux
              </span>
            </div>

            {/* Cartes métriques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Précision DDoS</span>
                <span className="text-lg font-bold text-emerald-400">
                  {(metriques_test_externe.precision_ddos * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Rappel DDoS</span>
                <span className="text-lg font-bold text-blue-400">
                  {(metriques_test_externe.recall_ddos * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">F1-Score DDoS</span>
                <span className="text-lg font-bold text-white">
                  {(metriques_test_externe.f1_ddos * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Exactitude</span>
                <span className="text-lg font-bold text-zinc-300">
                  {(metriques_test_externe.accuracy * 100).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Évaluation spécifique Normal 2017 seul */}
            {metriques_test_externe_normal_2017_seul && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Évaluation Spécifique : Normal CIC-IDS2017 Seul</span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {metriques_test_externe_normal_2017_seul.n_normal?.toLocaleString()} flux
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Rappel DDoS :</span>
                    <span className="text-blue-400 font-bold">
                      {(metriques_test_externe_normal_2017_seul.recall_ddos * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Taux Faux Positifs :</span>
                    <span className="text-amber-400 font-bold">
                      {(metriques_test_externe_normal_2017_seul.taux_faux_positifs * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Matrice de confusion réelle en Carte de Chaleur */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 font-mono">
                  <Grid className="w-3.5 h-3.5 text-blue-400" />
                  <span>Matrice de Confusion (Carte de Chaleur)</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Pourcentages par classe réelle</span>
              </div>

              <div className="bg-black/80 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
                <table className="w-full text-center text-xs font-mono border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-zinc-500 font-normal text-[11px] text-left">Réel \ Prédit</th>
                      <th className="p-2 text-zinc-300 font-semibold bg-zinc-900/60 rounded-t-lg">Prédit : Normal</th>
                      <th className="p-2 text-zinc-300 font-semibold bg-zinc-900/60 rounded-t-lg">Prédit : DDoS</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr>
                      <td className="p-2.5 text-left font-semibold text-zinc-300 bg-zinc-900/40 rounded-l-lg">
                        Normal ({totalNormal.toLocaleString()})
                      </td>
                      <td className="p-3 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 rounded-lg">
                        <div className="text-base font-bold">{tn.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-400/90 mt-0.5">{tnPct}% (Vrais Négatifs)</div>
                      </td>
                      <td className="p-3 bg-amber-950/30 border border-amber-500/30 text-amber-300 rounded-lg">
                        <div className="text-base font-bold">{fp.toLocaleString()}</div>
                        <div className="text-[10px] text-amber-400/90 mt-0.5">{fpPct}% (Faux Positifs)</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-left font-semibold text-zinc-300 bg-zinc-900/40 rounded-l-lg">
                        DDoS ({totalDDoS.toLocaleString()})
                      </td>
                      <td className="p-3 bg-rose-950/30 border border-rose-500/30 text-rose-300 rounded-lg">
                        <div className="text-base font-bold">{fn.toLocaleString()}</div>
                        <div className="text-[10px] text-rose-400/90 mt-0.5">{fnPct}% (Faux Négatifs)</div>
                      </td>
                      <td className="p-3 bg-blue-950/70 border border-blue-500/50 text-blue-300 rounded-lg">
                        <div className="text-base font-bold">{tp.toLocaleString()}</div>
                        <div className="text-[10px] text-blue-400/90 mt-0.5">{tpPct}% (Vrais Positifs)</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Colonne de droite : Importance des variables, Limitations et Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Graphique en barres : Importance des Features (Phase 2) */}
            {featureImportances.length > 0 && (
              <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-semibold text-white">Importance des Variables</h3>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">RandomForest</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90">
                  Indication sur le modèle, pas une preuve de causalité.
                </div>

                <div className="h-72 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={featureImportances}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 0.4]} tick={{ fill: '#71717a', fontSize: 10 }} />
                      <YAxis
                        type="category"
                        dataKey="feature"
                        width={130}
                        tick={{ fill: '#d4d4d8', fontSize: 9 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#09090b',
                          borderColor: '#27272a',
                          borderRadius: '0.75rem',
                          fontSize: '11px',
                          color: '#fff',
                        }}
                        formatter={(val) => [(val * 100).toFixed(2) + '%', 'Importance']}
                      />
                      <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Limitations documentées */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">Limitations Officielles</h3>
              </div>
              <ul className="text-xs text-zinc-300 space-y-2 leading-relaxed">
                {limitations.map((lim, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 9 Variables Réseau */}
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">9 Variables Réseau Retenues</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-black border border-zinc-800/80 flex items-center justify-between text-zinc-300"
                  >
                    <span className="text-blue-400 font-medium">{f}</span>
                    <span className="text-[10px] text-zinc-600">Feature #{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
