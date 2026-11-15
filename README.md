# Attack Watcher

Plateforme d'analyse et de détection d'attaques DDoS par Machine Learning en temps réel.

[![Python](https://img.shields.io/badge/Python-3.13%20%7C%203.15-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Sommaire

- [Présentation](#présentation)
- [Pipeline Machine Learning Réel](#pipeline-machine-learning-réel)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Architecture & Technologies](#architecture--technologies)
- [Limites & Périmètre](#limites--périmètre)
- [Installation et Démarrage Rapide](#installation-et-démarrage-rapide)
- [Tests et Qualité de Code](#tests-et-qualité-de-code)
- [Licence](#licence)

---

## Présentation

Attack Watcher est un système d'analyse et de classification du trafic réseau IP/TCP conçu pour détecter les attaques par déni de service distribué (DDoS). 

Le projet couple un pipeline d'apprentissage automatique supervisé (Random Forest et XGBoost), une API REST sous FastAPI et une interface réactive sous React 19 et Vite 8.

---

## Pipeline Machine Learning Réel

### 1. Ingestion et Harmonisation Multi-Datasets
Le pipeline supporte l'ingestion des jeux de données de référence :
- **CIC-IDS2017** (Friday DDoS)
- **CSE-CIC-IDS2018**
- **CIC-DDoS2019**

Les schémas de colonnes hétérogènes sont normalisés vers une nomenclature commune. Les étiquettes de classes sont strictement mappées :
- `BENIGN` / `Normal` : classe 0
- Toutes variantes d'attaques DDoS (`DDoS`, `DDoS-LOIC-HTTP`, `DDoS-Syn`, etc.) : classe 1
- Les attaques hors-périmètre DDoS (Bot, Brute Force, Web Attack) sont exclues de l'apprentissage binaire.

### 2. Sélection des 9 Caractéristiques (Sans Destination Port)
Pour limiter le surapprentissage lié aux ports d'écoute spécifiques de capture (ex: port 80 ou 443), la variable `Destination Port` a été retirée. Le modèle opère exclusivement sur 9 métriques de dynamique de flux :
1. `Flow Duration` : Durée totale du flux en microsecondes
2. `Total Fwd Packets` : Nombre total de paquets émis (aller)
3. `Total Backward Packets` : Nombre total de paquets reçus (retour)
4. `Total Length of Fwd Packets` : Volume total cumulé émis (octets)
5. `Total Length of Bwd Packets` : Volume total cumulé reçu (octets)
6. `Bwd Packet Length Std` : Écart-type de la taille des paquets retour
7. `Flow Packets/s` : Débit du flux en paquets par seconde
8. `Flow IAT Mean` : Temps moyen inter-paquets
9. `ACK Flag Count` : Présence du drapeau TCP ACK (0 ou 1)

### 3. Nettoyage et Pipeline sans Fuite (Zero Leakage)
- Suppression des espaces dans les noms de colonnes (`strip()`).
- Élimination des doublons.
- Conversion des valeurs infinies (`+inf`, `-inf`) en `NaN`.
- Encapsulation au sein d'une `Pipeline` scikit-learn :
  - `SimpleImputer(strategy='median')`
  - `StandardScaler()`
  - Classifieur (`RandomForestClassifier` ou `XGBClassifier`)
- L'imputation et la normalisation sont ajustées (`fit`) strictement sur le sous-ensemble d'apprentissage (`X_train`), interdisant toute fuite statistique vers le test.

### 4. Validation et Métriques Réelles
- Stratégie : Leave-One-Dataset-Out (LODO) en présence de plusieurs datasets, ou partition held-out externe (80% train / 20% test).
- Échantillons nettoyés : 209 653 enregistrements réels (Train : 167 722 flux, Test : 41 931 flux).
- Résultats réels sur le jeu de test externe :
  - **Random Forest (Modèle Champion)** :
    - Précision : 99.99% (0.9999)
    - Rappel : 99.93% (0.9993)
    - F1-Score : 99.96% (0.9996)
    - ROC-AUC : 1.0000
    - Matrice de confusion : TN = 16 433, FP = 2, FN = 18, TP = 25 478
  - **XGBoost** :
    - Précision : 99.99% (0.9999)
    - Rappel : 99.93% (0.9993)
    - F1-Score : 99.96% (0.9996)
    - ROC-AUC : 1.0000
    - Matrice de confusion : TN = 16 433, FP = 2, FN = 18, TP = 25 478

Les artefacts sont exportés dans `ml/artifacts/model.joblib` sous la forme d'un dictionnaire unifié contenant le pipeline, les métadonnées, la date d'entraînement et les scores réels.

---

## Fonctionnalités Principales

- **Inférence Unitaire** : Formulaire pour les 9 features avec restitution du verdict, du degré de certitude et de la probabilité DDoS.
- **Analyse par Lot (Fichiers CSV)** :
  - Contrôle strict des 9 colonnes obligatoires (rejet HTTP 400 explicite en cas d'absence).
  - Plafond de taille fixé à 50 Mo (rejet HTTP 413 si dépassé).
  - Synthèse statistique : total de lignes, lignes en erreur, comptages Normal et DDoS, taux d'attaque.
- **Historique Local** : Tableau conservant les 10 dernières analyses de lots de la session.
- **Transparence Télémétrique** : Point d'accès `/api/model-info` exposant la version du modèle, les datasets sources, la date et les métriques réelles sans données simulées.
- **Export Enrichi** : Téléchargement du CSV traité avec colonnes `Attack_Watcher_Prediction` et `DDoS_Probability`.

---

## Architecture & Technologies

```text
Attack-Watcher/
├── ml/
│   ├── train.py                # Pipeline d'entraînement réel (imputer + scaler + classifieurs)
│   ├── generate_sample_csv.py  # Extraction d'échantillons réels depuis le dataset
│   └── artifacts/              # model.joblib unifié et features.json
├── backend/
│   ├── app/
│   │   ├── main.py             # Routes FastAPI, validation 400/413/422, endpoint /api/model-info
│   │   ├── config.py           # Configuration absolue et limite 50 Mo
│   │   ├── schemas.py          # Modèles Pydantic v2 (9 features, CsvSummary, ModelInfoResponse)
│   │   └── predictor.py        # Moteur d'inférence vectorisé sans simulation
│   └── tests/
│       └── test_api.py         # Tests Pytest (9 tests unitaires et d'intégration)
└── frontend/
    └── src/
        ├── components/         # Composants UI (Console, CSV, Saisie, Historique 10, Benchmark)
        └── services/           # api.js et moteur client edgeML.js
```

---

## Limites & Périmètre

1. **Généralisation Inter-Datasets** : Bien que la validation Leave-One-Dataset-Out permette d'évaluer la robustesse face à des topologies réseau différentes, des variations substantielles dans l'architecture de capture, le bruit de fond ou les protocoles applicatifs peuvent induire un décalage de distribution (domain shift).
2. **Périmètre des Attaques Couvertes** : Le modèle est entraîné pour détecter les attaques par inondation volumétrique et épuisement de ressources (ex: SYN Flood, UDP Flood, HTTP GET/POST Flood). Il n'est pas conçu pour identifier les attaques applicatives ciblées sans volume anormal (ex: injections SQL, XSS) ni les attaques lentes non volumétriques (ex: Slowloris) sans suivi d'état étendu dans le temps.
3. **Retrait du Port de Destination** : Ce choix renforce l'indépendance du modèle vis-à-vis des ports standards (80, 443), mais transfère l'effort discriminatoire exclusivement sur les ratios de paquets, les durées et les intervalles d'arrivée.

---

## Installation et Démarrage Rapide

### Prérequis
- Python 3.13 ou 3.15
- Node.js 18+ et npm

### 1. Backend FastAPI
```bash
# Activation de l'environnement virtuel
.\.venv\Scripts\activate

# Démarrage de l'API
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

L'API sera disponible sur `http://localhost:8000`. La documentation OpenAPI interactive est accessible sur `http://localhost:8000/docs`.

### 2. Frontend React 19 + Vite
```bash
cd frontend
npm install
npm run dev
```

L'application web sera accessible sur `http://localhost:5173`.

---

## Tests et Qualité de Code

```bash
# Exécution de la suite de tests Pytest (9 tests)
.\.venv\Scripts\pytest

# Vérification du typage et linting Python (Ruff)
.\.venv\Scripts\ruff check backend ml

# Vérification du linting Frontend (ESLint)
npm --prefix frontend run lint

# Build de production Frontend
npm run build
```

---

## Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
