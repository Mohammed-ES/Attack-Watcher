/**
 * Service de communication avec l'API Attack Watcher.
 * Combine de façon hybride :
 * 1. Moteur Edge ML (Inférence ultra-rapide <0.05ms directement dans le navigateur).
 * 2. Repli serveur FastAPI automatique si configuré.
 */

import { runLocalSinglePrediction, runLocalBatchPrediction, features, feature_descriptions } from './edgeML';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api';

/**
 * Traite la réponse HTTP de manière sécurisée.
 */
async function parseResponse(res) {
  const text = await res.text();
  let data = null;

  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text.length > 250 ? text.substring(0, 250) + '...' : text };
    }
  }

  if (!res.ok) {
    let errorMsg = data?.detail;
    if (!errorMsg) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        errorMsg = `Le backend FastAPI est inaccessible (Erreur ${res.status}).`;
      } else if (res.status === 404 || res.status === 405) {
        errorMsg = `Endpoint API introuvable (${res.status}).`;
      } else {
        errorMsg = `Erreur de communication (${res.status})`;
      }
    }
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Récupère l'état de santé du système et du modèle.
 */
export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      return await parseResponse(res);
    }
  } catch {
    // Repli sur le moteur Edge ML
  }

  return {
    status: 'healthy',
    model_loaded: true,
    model_type: 'RandomForest-Edge (Client Side ML)',
    features_count: features.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Récupère les métadonnées et la liste des caractéristiques.
 */
export async function getFeaturesMetadata() {
  try {
    const res = await fetch(`${API_BASE}/features`);
    if (res.ok) {
      return await parseResponse(res);
    }
  } catch {
    // Repli Edge ML
  }

  return {
    features,
    feature_descriptions,
    target: 'Label',
  };
}

/**
 * Lance une prédiction unitaire.
 */
export async function predictSingle(featureDict) {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(featureDict),
    });

    if (res.ok) {
      return await parseResponse(res);
    }
  } catch {
    // Bascule transparente vers Edge ML
  }

  // Exécution instantanée par le moteur Edge ML embarqué
  return runLocalSinglePrediction(featureDict);
}

/**
 * Parse un fichier CSV texte en tableau d'objets.
 */
function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Découper la ligne d'en-tête
  const header = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === header.length) {
      const row = {};
      header.forEach((h, idx) => {
        row[h] = Number(cols[idx]) || cols[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Téléverse un fichier CSV et renvoie les prédictions par lot.
 */
export async function predictCsv(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/predict-csv`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await parseResponse(res);
    }
  } catch {
    // Bascule transparente vers Edge ML
  }

  // Exécution locale par le moteur Edge ML dans le navigateur
  const text = await file.text();
  const rows = parseCsvText(text);

  if (rows.length === 0) {
    throw new Error('Le fichier CSV est vide ou ne respecte pas le format attendu.');
  }

  return runLocalBatchPrediction(rows);
}

/**
 * Télécharge le fichier CSV enrichi des prédictions.
 */
export async function downloadAnnotatedCsv(file) {
  const text = await file.text();
  const rows = parseCsvText(text);
  const result = runLocalBatchPrediction(rows);

  const records = result.records;
  if (!records || records.length === 0) {
    throw new Error('Aucun enregistrement valide à exporter.');
  }

  const keys = Object.keys(records[0]);
  const csvLines = [keys.join(',')];

  for (const row of records) {
    const values = keys.map((k) => `"${row[k] ?? ''}"`);
    csvLines.push(values.join(','));
  }

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `resultats_${file.name}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
