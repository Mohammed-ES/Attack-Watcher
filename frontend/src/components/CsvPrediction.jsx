import { useState } from 'react';
import { UploadCloud, FileText, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
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
            Téléversez des captures de trafic réseau (format CIC-IDS2017) pour une classification de masse par lot.
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
              ? `${(file.size / 1024).toFixed(1)} Ko - Prêt pour l'inférence vectorisée`
              : 'Colonnes attendues : Destination Port, Flow Duration, Total Fwd Packets, etc.'}
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

      {/* Résultats de l'analyse */}
      {analysisResult && (
        <div className="space-y-6">
          <MetricsOverview summary={analysisResult.summary} />
          <Visualizations summary={analysisResult.summary} rows={analysisResult.rows} />
          <ResultsTable rows={analysisResult.rows} />
        </div>
      )}
    </div>
  );
}
