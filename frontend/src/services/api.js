/**
 * Service de communication avec l'API Attack Watcher.
 * Se connecte exclusivement au backend FastAPI sans aucune donnée simulée.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api';

/**
 * Traite la réponse HTTP et extrait les messages d'erreur du backend.
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
      if (res.status === 413) {
        errorMsg = 'Fichier trop volumineux. La taille maximale autorisée est de 50 Mo.';
      } else if (res.status === 422) {
        errorMsg = 'Données non conformes ou colonnes requises manquantes.';
      } else if (res.status === 503) {
        errorMsg = 'Le service d’inférence ML est indisponible sur le serveur.';
      } else if (res.status === 502 || res.status === 504) {
        errorMsg = `Le serveur est injoignable (${res.status}).`;
      } else if (res.status === 404 || res.status === 405) {
        errorMsg = `Le backend FastAPI est introuvable (${res.status}). Assurez-vous que le serveur est démarré (start_backend.bat ou uvicorn) et que VITE_API_BASE_URL est configuré si déployé.`;
      } else {
        errorMsg = `Erreur de communication avec le serveur (${res.status})`;
      }
    }
    const err = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    err.status = res.status;
    throw err;
  }

  return data;
}

/**
 * Vérifie l'état de l'API et du modèle.
 */
export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return parseResponse(res);
}

/**
 * Récupère les métadonnées et métriques réelles de features.json via /api/model-info.
 */
export async function getModelInfo() {
  const res = await fetch(`${API_BASE}/model-info`);
  return parseResponse(res);
}

/**
 * Récupère l'importance des 9 variables calculée par le RandomForest.
 */
export async function getFeatureImportance() {
  const res = await fetch(`${API_BASE}/feature-importance`);
  return parseResponse(res);
}

/**
 * Exécute une inférence unitaire sur les 9 features.
 */
export async function predictSingle(featureDict) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(featureDict),
  });
  return parseResponse(res);
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
  return parseResponse(res);
}

/**
 * Télécharge le fichier CSV enrichi des prédictions (Attack_Watcher_Prediction, DDoS_Probability).
 */
export async function downloadAnnotatedCsv(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/download-annotated-csv`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    await parseResponse(res);
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
