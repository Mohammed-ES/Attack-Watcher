import { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { predictCsv, downloadAnnotatedCsv } from '../services/api';
import MetricsOverview from './MetricsOverview';
import Visualizations from './Visualizations';
import ResultsTable from './ResultsTable';

export default function CsvPrediction() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  // Historique des 10 dernières analyses stocké en état local
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Veuillez sélectionner un fichier au format .csv valide.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.endsWith('.csv')) {
        setError('Format de fichier invalide. Seuls les fichiers .csv sont supportés.');
        return;
      }
      setFile(dropped);
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Veuillez charger un fichier CSV avant de lancer l’analyse.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await predictCsv(file);
      setAnalysisResult(data);

      // Enregistrement dans l'historique des 10 dernières analyses
      const totalRows = data.summary.total_rows ?? data.summary.total_analysed ?? 0;
      const errorRows = data.summary.error_rows ?? 0;
      const normalCount = data.summary.normal_count ?? data.summary.total_normal ?? 0;
      const ddosCount = data.summary.ddos_count ?? data.summary.total_attacks ?? 0;
      const attackPct = data.summary.attack_percentage ?? 0;

      const historyEntry = {
        id: Date.now(),
        dateStr: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        filename: file.name,
        total_rows: totalRows,
        error_rows: errorRows,
        normal_count: normalCount,
        ddos_count: ddosCount,
        attack_percentage: attackPct,
      };

      setAnalysisHistory((prev) => [historyEntry, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l’analyse du fichier CSV.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      await downloadAnnotatedCsv(file);
    } catch (err) {
      setError(err.message || 'Erreur lors du téléchargement du fichier annoté.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Zone de Téléversement */}
      <div className="bg-black/60 border border-zinc-800 rounded-2xl p-6 sm:p-7 backdrop-blur shadow-2xl">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-white tracking-tight">Import de Fichier CSV</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Téléversez des captures de flux réseau (format CIC-IDS2017 sans Destination Port, 50 Mo max) pour une analyse par lot.
          </p>
        </div>

        {/* Drag & drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-zinc-800 hover:border-blue-500/80 rounded-2xl p-10 text-center bg-zinc-950/40 transition cursor-pointer"
          onClick={() => document.getElementById('csv-file-input')?.click()}
        >
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <UploadCloud className="w-10 h-10 mx-auto text-blue-500 mb-3" />
          <p className="text-sm font-medium text-white">
            {file ? file.name : 'Glissez-déposez votre fichier CSV ici, ou cliquez pour parcourir'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {file
              ? `${(file.size / 1024).toFixed(1)} Ko - Prêt pour l'analyse`
              : 'Colonnes attendues : Flow Duration, Total Fwd Packets, Total Backward Packets, Flow Packets/s...'}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-zinc-800">
          <div className="flex items-center space-x-2 text-xs text-zinc-400">
            <FileText className="w-4 h-4 text-zinc-500" />
            <span>{file ? `Sélectionné : ${file.name}` : 'Aucun fichier sélectionné'}</span>
          </div>

          <div className="flex items-center space-x-3">
            {analysisResult && (
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-5 py-2.5 text-xs font-semibold rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition flex items-center space-x-2 active:scale-95"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Télécharger le CSV annoté</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="px-6 py-2.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xl shadow-blue-600/30 transition flex items-center space-x-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse par lot en cours...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Lancer l'analyse par lot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Résultats réels de l'analyse */}
      {analysisResult && (
        <div className="space-y-6">
          <MetricsOverview summary={analysisResult.summary} />
          <Visualizations summary={analysisResult.summary} rows={analysisResult.rows} />
          <ResultsTable rows={analysisResult.rows} />
        </div>
      )}

      {/* Historique des 10 dernières analyses (état local) */}
      {analysisHistory.length > 0 && (
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur shadow-xl">
          <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-zinc-800">
            <History className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Historique des Analyses (10 dernières)</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800/80 pb-2">
                  <th className="py-2 px-3 font-medium">Horodatage</th>
                  <th className="py-2 px-3 font-medium">Fichier</th>
                  <th className="py-2 px-3 font-medium">Lignes Analysées</th>
                  <th className="py-2 px-3 font-medium">Lignes en Erreur</th>
                  <th className="py-2 px-3 font-medium">Trafic Normal</th>
                  <th className="py-2 px-3 font-medium">Attaques DDoS</th>
                  <th className="py-2 px-3 font-medium">Taux d'Attaque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-mono">
                {analysisHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 text-zinc-300 transition">
                    <td className="py-2.5 px-3 text-zinc-500">{item.dateStr}</td>
                    <td className="py-2.5 px-3 text-white font-sans">{item.filename}</td>
                    <td className="py-2.5 px-3 text-blue-400 font-semibold">{item.total_rows.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      {item.error_rows > 0 ? (
                        <span className="text-rose-400">{item.error_rows}</span>
                      ) : (
                        <span className="text-zinc-500">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-400">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {item.normal_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-rose-400">
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {item.ddos_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-200">{item.attack_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
