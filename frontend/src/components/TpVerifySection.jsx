import { useState } from 'react';
import {
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ClipboardCheck,
  ShieldAlert,
  BarChart3,
  Grid,
  GitCompare,
  Table as TableIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ScrollReveal } from '../animations';
import { verifyTp } from '../services/api';

export default function TpVerifySection() {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const handleFileSelect = (type, selected) => {
    if (!selected) return;
    if (type === 'json' && !selected.name.toLowerCase().endsWith('.json')) {
      setError('Le fichier de résultats doit être au format .json (ex: resultats_TP_NOM.json).');
      return;
    }
    if (type === 'csv' && !selected.name.toLowerCase().endsWith('.csv')) {
      setError('Le fichier de prédictions doit être au format .csv (ex: predictions_TP_NOM.csv).');
      return;
    }
    setError(null);
    setReport(null);
    if (type === 'json') setJsonFile(selected);
    else setCsvFile(selected);
  };

  const handleVerify = async () => {
    if (!jsonFile || !csvFile) {
      setError('Veuillez déposer les deux fichiers (JSON et CSV) avant de lancer la vérification.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await verifyTp(jsonFile, csvFile);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Erreur lors de la vérification du TP.');
    } finally {
      setLoading(false);
    }
  };

  const metricsByPart = report?.metrics_by_part || [];
  const studentPart = metricsByPart.find((m) => m.key === 'partie3_modele_etudiant');
  const referencePart = metricsByPart.find((m) => m.key === 'partie4_modele_projet');

  const chartData = metricsByPart.map((m) => ({
    name: m.key.replace('partie', 'P').replace('_', ' '),
    recallPct: m.recall != null ? Number((m.recall * 100).toFixed(2)) : 0,
    tauxFpPct: m.taux_fp != null ? Number((m.taux_fp * 100).toFixed(2)) : 0,
  }));

  const cm = report?.recomputed_confusion_matrix || { vp: 0, fp: 0, vn: 0, fn: 0 };
  const totalNormalCm = (cm.vn ?? 0) + (cm.fp ?? 0);
  const totalDdosCm = (cm.fn ?? 0) + (cm.vp ?? 0);
  const vnPct = totalNormalCm > 0 ? (((cm.vn ?? 0) / totalNormalCm) * 100).toFixed(2) : '0.00';
  const fpPct = totalNormalCm > 0 ? (((cm.fp ?? 0) / totalNormalCm) * 100).toFixed(2) : '0.00';
  const fnPct = totalDdosCm > 0 ? (((cm.fn ?? 0) / totalDdosCm) * 100).toFixed(2) : '0.00';
  const vpPct = totalDdosCm > 0 ? (((cm.vp ?? 0) / totalDdosCm) * 100).toFixed(2) : '0.00';

  return (
    <section id="verify-tp" className="py-24 sm:py-32 bg-black border-t border-[#1a1a1e] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ScrollReveal direction="up">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-[#0c0c0e] text-blue-400 border border-[#222228]">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Évaluation Automatique</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Vérifier mon TP
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base font-normal">
              Déposez vos deux fichiers exportés depuis le notebook pour contrôler le schéma, la cohérence interne et la reproductibilité avec le modèle.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="rounded-3xl bg-[#0c0c0e] border border-[#1a1a1e] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Deux zones de dépôt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect('json', e.dataTransfer.files?.[0]);
                }}
                onClick={() => document.getElementById('tp-json-input')?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-blue-500/80 rounded-2xl p-8 text-center bg-zinc-950/50 transition cursor-pointer"
              >
                <input
                  id="tp-json-input"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileSelect('json', e.target.files?.[0])}
                  className="hidden"
                />
                <FileJson className="w-9 h-9 mx-auto text-blue-400 mb-3" />
                <p className="text-sm font-medium text-white">
                  {jsonFile ? jsonFile.name : 'resultats_TP_NOM.json'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {jsonFile
                    ? `${(jsonFile.size / 1024).toFixed(1)} Ko — Prêt`
                    : 'Glissez-déposez le fichier JSON ou cliquez pour parcourir'}
                </p>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect('csv', e.dataTransfer.files?.[0]);
                }}
                onClick={() => document.getElementById('tp-csv-input')?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-blue-500/80 rounded-2xl p-8 text-center bg-zinc-950/50 transition cursor-pointer"
              >
                <input
                  id="tp-csv-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect('csv', e.target.files?.[0])}
                  className="hidden"
                />
                <FileSpreadsheet className="w-9 h-9 mx-auto text-cyan-400 mb-3" />
                <p className="text-sm font-medium text-white">
                  {csvFile ? csvFile.name : 'predictions_TP_NOM.csv'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {csvFile
                    ? `${(csvFile.size / 1024).toFixed(1)} Ko — Prêt`
                    : '9 features + Label + pred_projet (50 Mo max)'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleVerify}
                disabled={!jsonFile || !csvFile || loading}
                className="px-6 py-2.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Lancer la vérification</span>
                  </>
                )}
              </button>
            </div>

            {/* Rapport de vérification calculé depuis les fichiers envoyés */}
            {report && (
              <div className="space-y-6 pt-4 border-t border-zinc-800">
                {/* Score automatique (critères numériques uniquement) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-black border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Score automatique (critères numériques)
                    </span>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span
                        className={`text-3xl font-bold font-mono ${
                          report.all_numeric_passed ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {report.score} / {report.max_score}
                      </span>
                      <span className="text-sm font-mono text-zinc-400">
                        ({report.percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Lignes CSV vérifiées
                    </span>
                    <div className="mt-2 text-2xl font-bold font-mono text-white">
                      {report.total_csv_rows?.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-black border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Version scikit-learn déclarée
                    </span>
                    <div className="mt-2 text-2xl font-bold font-mono text-blue-400">
                      {report.sklearn_version || '—'}
                    </div>
                  </div>
                </div>

                {/* Tableau des contrôles */}
                <div className="bg-black/80 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-950/60">
                          <th className="py-3 px-4 font-medium w-16 text-center">Statut</th>
                          <th className="py-3 px-4 font-medium">Contrôle</th>
                          <th className="py-3 px-4 font-medium">Détail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {report.checks?.map((chk) => (
                          <tr key={chk.id} className="hover:bg-zinc-900/30 transition">
                            <td className="py-3 px-4 text-center">
                              {chk.status === 'pass' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/50" title="Validé">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {chk.status === 'fail' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-950/60 text-rose-400 border border-rose-700/50" title="Échec">
                                  <XCircle className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {chk.status === 'warning' && (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-950/60 text-amber-400 border border-amber-700/50" title="Avertissement">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-medium text-white">
                              {chk.label}
                              {!chk.numeric && (
                                <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                                  Informatif
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-zinc-300 font-mono text-[11px]">
                              {chk.detail}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tableau des métriques par partie */}
                {metricsByPart.length > 0 && (
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                      <TableIcon className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">
                        Métriques importées par partie
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="text-zinc-500 border-b border-zinc-800">
                            <th className="py-2 px-3 font-sans">Partie</th>
                            <th className="py-2 px-3">VP</th>
                            <th className="py-2 px-3">FP</th>
                            <th className="py-2 px-3">VN</th>
                            <th className="py-2 px-3">FN</th>
                            <th className="py-2 px-3">Recall</th>
                            <th className="py-2 px-3">Taux FP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                          {metricsByPart.map((m) => (
                            <tr key={m.key} className="hover:bg-zinc-900/30 text-zinc-200">
                              <td className="py-2.5 px-3 font-sans font-medium text-white">{m.label}</td>
                              <td className="py-2.5 px-3 text-blue-400">{m.vp ?? '—'}</td>
                              <td className="py-2.5 px-3 text-amber-400">{m.fp ?? '—'}</td>
                              <td className="py-2.5 px-3 text-emerald-400">{m.vn ?? '—'}</td>
                              <td className="py-2.5 px-3 text-rose-400">{m.fn ?? '—'}</td>
                              <td className="py-2.5 px-3 font-semibold text-white">
                                {m.recall != null ? `${(m.recall * 100).toFixed(2)}%` : '—'}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-zinc-300">
                                {m.taux_fp != null ? `${(m.taux_fp * 100).toFixed(2)}%` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Carte de chaleur (Matrice recalculée) + Comparaison Modèle Étudiant vs Référence */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Matrice de confusion en carte de chaleur */}
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <Grid className="w-4 h-4 text-blue-400" />
                        <span>Matrice de Confusion (CSV recalculée)</span>
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">Carte de chaleur</span>
                    </div>

                    <table className="w-full text-center text-xs font-mono border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 text-zinc-500 font-normal text-[11px] text-left">Réel \ Prédit</th>
                          <th className="p-2 text-zinc-300 font-semibold bg-zinc-900/60">Prédit : Normal</th>
                          <th className="p-2 text-zinc-300 font-semibold bg-zinc-900/60">Prédit : DDoS</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2.5 text-left font-semibold text-zinc-300 bg-zinc-900/40">
                            Normal ({totalNormalCm.toLocaleString()})
                          </td>
                          <td className="p-3 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                            <div className="text-base font-bold">{(cm.vn ?? 0).toLocaleString()}</div>
                            <div className="text-[10px] text-emerald-400/90 mt-0.5">{vnPct}% (VN)</div>
                          </td>
                          <td className="p-3 bg-amber-950/30 border border-amber-500/30 text-amber-300">
                            <div className="text-base font-bold">{(cm.fp ?? 0).toLocaleString()}</div>
                            <div className="text-[10px] text-amber-400/90 mt-0.5">{fpPct}% (FP)</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-left font-semibold text-zinc-300 bg-zinc-900/40">
                            DDoS ({totalDdosCm.toLocaleString()})
                          </td>
                          <td className="p-3 bg-rose-950/30 border border-rose-500/30 text-rose-300">
                            <div className="text-base font-bold">{(cm.fn ?? 0).toLocaleString()}</div>
                            <div className="text-[10px] text-rose-400/90 mt-0.5">{fnPct}% (FN)</div>
                          </td>
                          <td className="p-3 bg-blue-950/70 border border-blue-500/50 text-blue-300">
                            <div className="text-base font-bold">{(cm.vp ?? 0).toLocaleString()}</div>
                            <div className="text-[10px] text-blue-400/90 mt-0.5">{vpPct}% (VP)</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Comparaison Modèle Étudiant (Partie 3) vs Modèle de Référence (Partie 4) */}
                  {studentPart && referencePart && (
                    <div className="bg-black/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                        <GitCompare className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-white">
                          Modèle Étudiant vs Modèle de Référence
                        </h4>
                      </div>
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="text-zinc-500 border-b border-zinc-800">
                            <th className="py-2 px-2 font-sans">Indicateur</th>
                            <th className="py-2 px-2">Étudiant (P3)</th>
                            <th className="py-2 px-2">Référence (P4)</th>
                            <th className="py-2 px-2">Écart</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                          <tr>
                            <td className="py-2.5 px-2 font-sans text-zinc-300">Recall</td>
                            <td className="py-2.5 px-2 text-blue-400">
                              {studentPart.recall != null ? `${(studentPart.recall * 100).toFixed(2)}%` : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-emerald-400">
                              {referencePart.recall != null ? `${(referencePart.recall * 100).toFixed(2)}%` : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-zinc-200">
                              {studentPart.recall != null && referencePart.recall != null
                                ? `${((studentPart.recall - referencePart.recall) * 100).toFixed(2)} pts`
                                : '—'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-2 font-sans text-zinc-300">Taux FP</td>
                            <td className="py-2.5 px-2 text-amber-400">
                              {studentPart.taux_fp != null ? `${(studentPart.taux_fp * 100).toFixed(2)}%` : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-emerald-400">
                              {referencePart.taux_fp != null ? `${(referencePart.taux_fp * 100).toFixed(2)}%` : '—'}
                            </td>
                            <td className="py-2.5 px-2 text-zinc-200">
                              {studentPart.taux_fp != null && referencePart.taux_fp != null
                                ? `${((studentPart.taux_fp - referencePart.taux_fp) * 100).toFixed(2)} pts`
                                : '—'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Graphique Recharts des scores par partie */}
                {chartData.length > 0 && (
                  <div className="bg-black/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">
                        Graphique des scores par partie (Recharts)
                      </h4>
                    </div>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                          <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 11 }} unit="%" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#09090b',
                              borderColor: '#27272a',
                              borderRadius: '0.75rem',
                              fontSize: '12px',
                              color: '#fff',
                            }}
                            formatter={(value) => `${value}%`}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="recallPct" name="Recall (%)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="tauxFpPct" name="Taux FP (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Avertissement sur les points non évalués automatiquement */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider text-amber-400 block">
                      Limites de la vérification automatique
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-amber-200/90">
                      {report.limitations?.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
