/**
 * Moteur d'inférence Machine Learning embarqué côté client (Zero Server Dependency).
 * Exécute le modèle Random Forest (100 arbres) et le standard scaler CIC-IDS2017
 * directement en JavaScript dans le navigateur pour une vitesse d'inférence de < 0.1ms
 * et une disponibilité à 100% sur n'importe quel hébergeur statique (Vercel, GitHub Pages, Netlify).
 */

import modelData from './modelBundle.json';

const { features, feature_descriptions, mean, scale, trees } = modelData;

/**
 * Normalise un vecteur de caractéristiques via le StandardScaler (Z-score).
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
 * Prédire la probabilité et le label pour un flux unique.
 */
export function runLocalSinglePrediction(featureDict) {
  const rawValues = features.map((f) => Number(featureDict[f]) || 0);
  const scaled = transformFeatures(rawValues);

  let sumProb = 0;
  for (let i = 0; i < trees.length; i++) {
    sumProb += predictTree(trees[i], scaled);
  }

  const probability = sumProb / trees.length;
  const isAttack = probability >= 0.5;

  return {
    prediction: isAttack ? 'Attaque DDoS' : 'Normal',
    is_ddos: isAttack,
    label: isAttack ? 1 : 0,
    probability: Math.round(probability * 10000) / 10000,
    confidence: Math.round(Math.max(probability, 1 - probability) * 10000) / 100,
    model_name: 'RandomForest-Edge (Client Side ML)',
    input_features: featureDict,
  };
}

/**
 * Exécute la classification de masse par lot sur un tableau d'enregistrements CSV
 * avec le schéma exact attendu par les composants React (summary + rows).
 */
export function runLocalBatchPrediction(rows, filename = 'sample_traffic.csv') {
  const detailedRows = [];
  let ddosCount = 0;
  let normalCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
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
      total_analysed: total,
      total_attacks: ddosCount,
      total_normal: normalCount,
      attack_percentage: attackPercentage,
    },
    rows: detailedRows,
    filename,
  };
}

export { features, feature_descriptions };
