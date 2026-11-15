/**
 * Moteur d'inférence Machine Learning embarqué côté client.
 * Exécute le modèle Random Forest (100 arbres) et le pipeline de standardisation
 * directement en JavaScript dans le navigateur pour une disponibilité continue sur hébergeurs statiques.
 */

import modelData from './modelBundle.json';

const { features, feature_descriptions, mean, scale, trees } = modelData;

/**
 * Normalise un vecteur de caractéristiques via le StandardScaler fitté sur le train set.
 */
function transformFeatures(rawValues) {
  return rawValues.map((val, idx) => {
    const s = scale[idx] || 1;
    const m = mean[idx] || 0;
    return (val - m) / s;
  });
}

/**
 * Parcourt un arbre de décision pour obtenir la probabilité de classe 1 (DDoS).
 */
function predictTree(nodes, scaledFeatures) {
  let curr = 0;
  while (nodes[curr].left !== -1 && nodes[curr].right !== -1) {
    const node = nodes[curr];
    const val = scaledFeatures[node.feat];
    if (val <= node.thresh) {
      curr = node.left;
    } else {
      curr = node.right;
    }
  }
  return nodes[curr].prob;
}

/**
 * Prédire la probabilité et le label pour un flux unique sur les 9 features.
 */
export function runLocalSinglePrediction(featureDict) {
  const rawValues = features.map((f) => Number(featureDict[f]) || 0);
  const scaled = transformFeatures(rawValues);

  let sumProb = 0;
  for (let i = 0; i < trees.length; i++) {
    sumProb += predictTree(trees[i], scaled);
  }

  const probability = trees.length > 0 ? sumProb / trees.length : 0;
  const isAttack = probability >= 0.5;

  return {
    prediction: isAttack ? 'Attaque DDoS' : 'Normal',
    is_ddos: isAttack,
    label: isAttack ? 1 : 0,
    probability: Math.round(probability * 10000) / 10000,
    confidence: Math.round(Math.max(probability, 1 - probability) * 10000) / 100,
    model_name: 'RandomForest (Pipeline Client Side)',
    input_features: featureDict,
  };
}

/**
 * Exécute la classification de masse par lot sur un tableau d'enregistrements CSV
 * avec vérification stricte des colonnes requises et comptage des erreurs.
 */
export function runLocalBatchPrediction(rows, filename = 'sample_traffic.csv') {
  if (!rows || rows.length === 0) {
    throw new Error('Le fichier CSV est vide.');
  }

  // Vérification de la présence des 9 colonnes obligatoires sur le premier enregistrement
  const sampleKeys = Object.keys(rows[0] || {});
  const manquantes = features.filter((f) => !sampleKeys.includes(f));
  if (manquantes.length > 0) {
    throw new Error(
      `Colonnes requises manquantes dans le fichier CSV : ${JSON.stringify(manquantes)}. Colonnes attendues : ${JSON.stringify(features)}`
    );
  }

  const detailedRows = [];
  let ddosCount = 0;
  let normalCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Vérifier si des valeurs numériques sont manquantes ou corrompues
    for (const f of features) {
      const v = row[f];
      if (v === undefined || v === null || v === '' || isNaN(Number(v))) {
        errorCount++;
        break;
      }
    }

    const pred = runLocalSinglePrediction(row);
    if (pred.is_ddos) {
      ddosCount++;
    } else {
      normalCount++;
    }

    detailedRows.push({
      row_index: i + 1,
      prediction: pred.prediction,
      is_ddos: pred.is_ddos,
      probability: pred.probability,
      features: row,
    });
  }

  const total = rows.length;
  const attackPercentage = total > 0 ? Math.round((ddosCount / total) * 10000) / 100 : 0;

  return {
    summary: {
      total_rows: total,
      error_rows: errorCount,
      normal_count: normalCount,
      ddos_count: ddosCount,
      attack_percentage: attackPercentage,
      // Rétrocompatibilité
      total_analysed: total,
      total_attacks: ddosCount,
      total_normal: normalCount,
    },
    rows: detailedRows,
    filename,
  };
}

export { features, feature_descriptions };
