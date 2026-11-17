# Attack Watcher

Plateforme d'analyse et de détection d'attaques DDoS par Machine Learning.

[![Python](https://img.shields.io/badge/Python-3.10%20%C3%A0%203.13-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Sommaire

- [Présentation](#présentation)
- [Pipeline Machine Learning](#pipeline-machine-learning)
- [Métriques et Évaluation Réelles](#métriques-et-évaluation-réelles)
- [Limitations Officielles](#limitations-officielles)
- [Fonctionnalités du Système](#fonctionnalités-du-système)
- [Architecture & Technologies](#architecture--technologies)
- [Installation et Démarrage Rapide](#installation-et-démarrage-rapide)
- [Tests et Qualité de Code](#tests-et-qualité-de-code)
- [Licence](#licence)

---

## Présentation

Attack Watcher est un système d'analyse et de classification du trafic réseau IP/TCP conçu pour détecter les attaques par déni de service distribué (DDoS). 

Le projet couple un pipeline scikit-learn (`SimpleImputer` + `RandomForestClassifier`), une API REST haute performance sous FastAPI et une interface moderne sous React 19 et Vite 8.

---

## Pipeline Machine Learning

L'entraînement du modèle a été réalisé dans un environnement externe (notebook Jupyter) et exporté sous forme d'artefacts sérialisés dans `ml/artifacts/`.

### 1. Architecture du Pipeline
- **Pipeline scikit-learn** : `Pipeline(steps=[('imputer', SimpleImputer(strategy='median')), ('classifier', RandomForestClassifier(...))])`.
- **Aucun Scaler** : Aucun composant de mise à l'échelle ni normalisation n'est utilisé dans le pipeline, les arbres de décision du Random Forest étant invariants aux transformations monotones d'échelle.
- **Architecture Dédiée** : Le modèle déployé est exclusivement un `RandomForestClassifier`.
- **Artefacts fournis** :
  - `ml/artifacts/model.joblib` : Objet `sklearn.pipeline.Pipeline` complet.
  - `ml/artifacts/features.json` : Métadonnées exhaustives (version, date d'entraînement, features, classes, datasets, métriques de validation externe, limitations).

### 2. Sélection des 9 Caractéristiques (Sans Destination Port)
Pour éviter tout surapprentissage dépendant d'un port d'écoute spécifique (ex: port 80 ou 443), la variable `Destination Port` a été retirée. Le modèle opère strictement sur 9 métriques de dynamique de flux dans cet ordre :
1. `Flow Duration` : Durée totale du flux en microsecondes
2. `Total Fwd Packets` : Nombre total de paquets émis (aller)
3. `Total Backward Packets` : Nombre total de paquets reçus (retour)
4. `Total Length of Fwd Packets` : Volume total cumulé émis (octets)
5. `Total Length of Bwd Packets` : Volume total cumulé reçu (octets)
6. `Bwd Packet Length Std` : Écart-type de la taille des paquets retour
7. `Flow Packets/s` : Débit du flux en paquets par seconde
8. `Flow IAT Mean` : Temps moyen inter-paquets
9. `ACK Flag Count` : Présence du drapeau TCP ACK (0 ou 1)

### 3. Nettoyage et Élimination des Fuites (Anti-Leakage)
- L'entraînement et le test ont été réalisés sur des jeux de données et fichiers strictement disjoints.
- Nettoyage en amont de l'inférence : suppression des espaces dans les noms de colonnes (`strip()`), sélection stricte des 9 colonnes requises, conversion numérique avec `pd.to_numeric(errors="coerce")`, et conversion des valeurs `+inf` et `-inf` en `NaN`.
- Aucune imputation manuelle n'est faite hors du modèle : le `SimpleImputer` interne au pipeline gère les valeurs `NaN`.

---

## Métriques et Évaluation Réelles

Les données ci-dessous proviennent exclusivement du fichier de métadonnées officiel `ml/artifacts/features.json` (version 1.3.0, entraînement du 2026-11-15).

### Datasets
- **Datasets d'Entraînement** :
  - `CIC-IDS2017 (sauf Normal reserve)`
  - `CIC-DDoS2019 (sauf attaques reservees)`
- **Dataset de Test Externe** :
  - `Attaques 2019 reservees (TFTP, UDPLag, DrDoS_LDAP) + Normal reserve (CIC-IDS2017 lundi et jeudi, et 30 564 Normal de CIC-DDoS2019)`

### Évaluation Globale sur Test Externe (5 374 929 flux)
- **Exactitude (Accuracy)** : 99.61 % (0.9961)
- **Précision DDoS** : 99.93 % (0.9993)
- **Rappel DDoS (Recall)** : 99.61 % (0.9961)
- **F1-Score DDoS** : 99.77 % (0.9977)
- **Matrice de Confusion** :
  - Vrais Négatifs (TN, Normal classé Normal) : 845 791
  - Faux Positifs (FP, Fausses alertes) : 3 257
  - Faux Négatifs (FN, DDoS non détectés) : 17 510
  - Vrais Positifs (TP, DDoS détectés) : 4 508 371
  - Total flux Normal test : 849 048
  - Total flux DDoS test : 4 525 881

### Évaluation Spécifique (Normal CIC-IDS2017 Seul, 818 484 flux)
- **Rappel DDoS** : 99.61 % (0.9961)
- **Taux de Faux Positifs** : 0.37 % (0.0037)

---

## Limitations Officielles

> **Mention Légale : Prototype de Recherche**  
> Ce système est un prototype de recherche universitaire et expérimentale, non validé pour un déploiement en production industrielle.

Conformément à `features.json` :
1. Prototype de recherche, non valide en production.
2. Les attaques réservées appartiennent aux mêmes familles que l'entraînement (DrDoS) ; la généralisation à d'autres types d'attaques n'est pas mesurée.
3. Les autres types d'attaques (PortScan, Bot, Web Attack, FTP-Patator, Slowloris) sont exclus du périmètre.

---

## Fonctionnalités du Système

- **Inférence Unitaire** : Formulaire interactif sur les 9 variables réseau avec presets réels validés (`Trafic Normal` et `Attaque DDoS`), renvoyant le verdict ("Normal" ou "DDoS") et la probabilité DDoS issue de `predict_proba`.
- **Analyse par Lot (Fichiers CSV)** :
  - Validation stricte des 9 colonnes obligatoires (rejet HTTP 422 avec la liste des colonnes manquantes).
  - Plafond de taille fixé à 50 Mo (rejet HTTP 413 si dépassé).
  - Lecture vectorisée sans saturation mémoire.
  - Restitution du nombre de lignes analysées, lignes en erreur, totaux Normal et DDoS, et résultats paginables.
- **Export CSV Enrichi** : Téléchargement du fichier CSV augmenté des colonnes `Attack_Watcher_Prediction` et `DDoS_Probability`.
- **Historique Local de Session** : Suivi des 10 dernières analyses de lots en mémoire locale.
- **Transparence Totale** : Endpoint `GET /api/model-info` fournissant dynamiquement la version, la date, les métriques et les limitations directement depuis `features.json`.
- **Aucune Donnée Simulée** : Si le modèle n'est pas chargé, `/api/health` renvoie le statut `degraded` (`model_loaded=False`) et les endpoints d'inférence répondent HTTP 503 (Service Indisponible).

---

## Architecture & Technologies

```text
Attack-Watcher/
├── ml/
│   └── artifacts/
│       ├── model.joblib        # Pipeline scikit-learn (SimpleImputer + RandomForestClassifier)
│       └── features.json        # Métadonnées, métriques réelles et limitations
├── backend/
│   ├── app/
│   │   ├── main.py             # Routes FastAPI, gestion des erreurs 413/422/503, /api/model-info
│   │   ├── config.py           # Résolution absolue des chemins (Path(__file__)) et limite 50 Mo
│   │   ├── schemas.py          # Modèles Pydantic v2 (9 features, CsvSummary, ModelInfoResponse)
│   │   └── predictor.py        # Moteur d'inférence vectorisé sans simulation ni scaler
│   ├── tests/
│   │   └── test_api.py         # Tests Pytest (9 tests unitaires et d'intégration)
│   └── requirements.txt        # Dépendances figées (scikit-learn==1.6.1)
└── frontend/
    └── src/
        ├── components/         # Composants UI (Console, CSV, Saisie, Historique 10, Benchmark)
        └── services/           # api.js (appels API stricts sans fallback simulé)
```

---

## Installation et Démarrage Rapide

### Prérequis
- **Python** : 3.10, 3.11, 3.12 ou 3.13 recommandé (pour les binaires précompilés officiels de scikit-learn 1.6.1).
- **Node.js** : 18+ et npm.

### 1. Backend FastAPI
```bash
# Installation des dépendances Python
pip install -r backend/requirements.txt

# Démarrage du serveur FastAPI
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

L'API est accessible sur `http://localhost:8000`. La documentation OpenAPI Swagger est disponible sur `http://localhost:8000/docs`.

### 2. Frontend React 19 + Vite
```bash
cd frontend
npm install
npm run dev
```

L'interface web est accessible sur `http://localhost:5173`.

---

## Tests et Qualité de Code

```bash
# Exécution des tests Pytest (9 tests : prédiction unitaire, CSV, rejets 422/413/503, /api/model-info)
.\.venv\Scripts\pytest

# Vérification du code Python avec Ruff
.\.venv\Scripts\ruff check backend

# Vérification ESLint Frontend
npm --prefix frontend run lint

# Build de production Frontend
npm run build
```

---

## Licence

Ce projet est distribué sous licence MIT. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.
