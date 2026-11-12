/**
 * Service de communication avec l'API FastAPI Attack Watcher.
 */

const API_BASE = '/api';

/**
 * Récupère l'état de santé du système et du modèle.
 */
export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Erreur serveur (${res.status})`);
  }
  return res.json();
}

/**
 * Récupère les métadonnées des features et statistiques ML.
 */
export async function getFeaturesMetadata() {
  const res = await fetch(`${API_BASE}/features`);
  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération des métadonnées (${res.status})`);
  }
  return res.json();
}

/**
 * Lance une prédiction unitaire sur 10 métriques réseau.
 */
export async function predictSingle(features) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(features),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Erreur de prédiction (${res.status})`);
  }
  return data;
}

/**
 * Téléverse un fichier CSV et renvoie les prédictions par lot.
 */
export async function predictCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/predict-csv`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Erreur lors de l'analyse du CSV (${res.status})`);
  }
  return data;
}

/**
 * Télécharge le fichier CSV enrichi des prédictions.
 */
export async function downloadAnnotatedCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/download-annotated-csv`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur de téléchargement (${res.status})`);
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `resultats_${file.name}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

