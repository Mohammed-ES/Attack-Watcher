/**
 * Service de communication avec l'API FastAPI Attack Watcher.
 * Supporte le proxy local Vite (/api) et le déploiement externe Vercel via VITE_API_BASE_URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '/api';

/**
 * Traite la réponse HTTP de manière sécurisée en évitant les erreurs de syntaxe JSON.
 */
async function parseResponse(res) {
  const text = await res.text();
  let data = null;

  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch {
      // Réponse non-JSON (ex: erreur HTML de proxy ou texte brut)
      data = { detail: text.length > 250 ? text.substring(0, 250) + '...' : text };
    }
  }

  if (!res.ok) {
    let errorMsg = data?.detail;
    if (!errorMsg) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        errorMsg = `Le backend FastAPI est inaccessible (Erreur ${res.status}). Assurez-vous que le serveur Python est démarré sur http://localhost:8000 ou configurez VITE_API_BASE_URL.`;
      } else if (res.status === 404) {
        errorMsg = `Endpoint API introuvable (${res.status}). Vérifiez la route ou la variable VITE_API_BASE_URL.`;
      } else {
        errorMsg = `Erreur de communication avec le serveur (${res.status})`;
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
    return await parseResponse(res);
  } catch (err) {
    console.warn('[Attack Watcher] Backend /health indisponible:', err.message);
    throw err;
  }
}

/**
 * Récupère les métadonnées des features et statistiques ML.
 */
export async function getFeaturesMetadata() {
  try {
    const res = await fetch(`${API_BASE}/features`);
    return await parseResponse(res);
  } catch (err) {
    console.warn('[Attack Watcher] Backend /features indisponible:', err.message);
    throw err;
  }
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

  return await parseResponse(res);
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

  return await parseResponse(res);
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
    await parseResponse(res); // Déclenchera l'erreur descriptive
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
