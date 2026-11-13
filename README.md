---
title: Attack Watcher API
emoji: 🛡️
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="attack-watcher-logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="attack-watcher-logo-light.png">
  <img alt="Attack Watcher Logo" src="attack-watcher-logo-dark.png" width="280" />
</picture>

### Plateforme d'analyse et de détection d'attaques DDoS par Machine Learning en temps réel

[![CI - Attack Watcher](https://github.com/Mohammed-ES/Attack-Watcher/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammed-ES/Attack-Watcher/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.13%20%7C%203.15-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black.svg?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Architecture & Technologies](#architecture--technologies)
- [Jeu de Données et Benchmark (CIC-IDS2017)](#jeu-de-données-et-benchmark-cic-ids2017)
- [Installation et Démarrage Rapide](#installation-et-démarrage-rapide)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Tests et Qualité de Code](#tests-et-qualité-de-code)
- [Intégration Continue (CI)](#intégration-continue-ci)
- [Licence](#licence)

---

## Présentation

**Attack Watcher** est une application web conçue pour les équipes de cybersécurité (SOC / CERT), les administrateurs d'infrastructure et les ingénieurs réseau. Elle permet d'inspecter et de classifier les flux de trafic TCP/IP afin de détecter avec certitude les attaques par déni de service distribué (DDoS).

Le système s'appuie sur des modèles d'apprentissage automatique supervisé entraînés sur des caractéristiques réseau discriminantes, offrant à la fois une interface d'inférence unitaire pour des tests ciblés et un moteur d'analyse par lot pour le traitement de fichiers de capture au format CSV.

Pour une description exhaustive des choix techniques, consultez le document [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Fonctionnalités Principales

- **Inférence Unitaire Ultra-Rapide (< 0.05 ms)** : Formulaire interactif permettant de renseigner les 10 caractéristiques d'un flux réseau et d'obtenir immédiatement le verdict ("Normal" ou "Attaque DDoS"), la probabilité calculée et l'analyse contextuelle.
- **Présélections de Flux Prêtes à l'Emploi** : Chargement instantané en un clic de profils de test représentatifs (trafic web HTTP légitime ou attaque DDoS par inondation massive).
- **Analyse par Lot (Fichiers CSV)** : Téléversement et streaming vectorisé de captures volumineuses sans saturation mémoire ni latence.
- **Tableau de Bord & Visualisations Télémétriques** : Graphiques vectoriels interactifs détaillant la proportion des flux et la répartition par paliers de probabilité de risque.
- **Exploration Paginée & Tri Dynamique** : Filtrage par statut de menace, recherche textuelle par port et tri multicritères.
- **Export Enrichi SIEM** : Téléchargement du fichier CSV d'origine complété des colonnes `Attack_Watcher_Prediction` et `DDoS_Probability` pour intégration immédiate dans Splunk, Elastic ou Graylog.

---

## Architecture & Technologies

Le projet s'articule autour de trois modules indépendants et rigoureusement typés :

```text
Attack-Watcher/
├── ml/                      # Pipeline Machine Learning et artefacts
│   ├── train.py             # Script complet (nettoyage, split stratifié, benchmark, export)
│   ├── generate_sample_csv.py # Générateur de jeux d'échantillons de test
│   ├── requirements.txt     # Dépendances ML
│   └── artifacts/           # Modèle champion (.joblib), scaler (.joblib), métadonnées (.json)
├── backend/                 # API REST FastAPI
│   ├── app/
│   │   ├── main.py          # Point d'entrée, gestion du cycle de vie et routes
│   │   ├── config.py        # Configuration centralisée et politique CORS
│   │   ├── schemas.py       # Validation Pydantic v2
│   │   └── predictor.py     # Service d'inférence thread-safe
│   ├── tests/               # Suite de tests Pytest (/predict, /predict-csv, validation 422)
│   └── requirements.txt     # Dépendances backend
├── frontend/                # Application Web React 19 + Vite 8
│   ├── src/
│   │   ├── components/      # Composants d'interface modulaires (Hero, Console, FAQ, etc.)
│   │   ├── services/        # Couche API résiliente (api.js avec support Vercel)
│   │   ├── App.jsx          # Assemblage principal de l'application
│   │   └── main.jsx         # Point d'entrée React
│   ├── vercel.json          # Configuration des routes SPA pour Vercel
│   ├── .env.example         # Gabarit de configuration des variables d'environnement
│   ├── vite.config.js       # Configuration Vite avec proxy /api et alias @
│   ├── tailwind.config.js   # Configuration de style (Aura theme)
│   └── package.json         # Dépendances frontend
├── vercel.json              # Configuration racine pour le déploiement Vercel
├── .env.example             # Gabarit racine des variables d'environnement
├── ARCHITECTURE.md          # Documentation technique détaillée
├── LICENSE                  # Licence logicielle MIT
├── pytest.ini               # Configuration des tests Python
└── README.md
```

### Stack Technique

| Domaine | Outils et Bibliothèques |
| :--- | :--- |
| **Machine Learning** | Python 3.13 / 3.15, Scikit-Learn 1.9.1, XGBoost 3.4.1, Pandas, NumPy, Joblib |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Qualité & Tests Backend** | Pytest, HTTPX, Ruff |
| **Frontend** | React 19, Vite 8, Framer Motion, Recharts, Tailwind CSS, Lucide Icons |
| **Qualité Frontend** | ESLint 9 |
| **Hébergement & Déploiement** | Vercel (Frontend), Render / Railway / Docker (Backend) |
| **CI / CD** | GitHub Actions |

---

## Jeu de Données et Benchmark (CIC-IDS2017)

Le modèle a été conçu et calibré à partir du jeu de données de référence international **CIC-IDS2017**, produit par le **Canadian Institute for Cybersecurity (CIC)** de l'Université du Nouveau-Brunswick (UNB).

- **Fichier de référence** : `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv`
- **Source officielle du dataset** : [UNB Canadian Institute for Cybersecurity - IDS 2017](https://www.unb.ca/cic/datasets/ids-2017.html)
- **Publication scientifique** :
  > Iman Sharafaldin, Arash Habibi Lashkari, and Ali A. Ghorbani, *"Toward Generating a New Dataset for Security Analysis: Towards Developing Newer Intrusion Detection Datasets"*, Proceedings of the International Conference on Information Systems Security and Privacy (ICISSP), 2018.

---

## Installation et Démarrage Rapide

### 1. Cloner le Projet
```bash
git clone https://github.com/Mohammed-ES/Attack-Watcher.git
cd Attack-Watcher
```

### 2. Environnement Python et Entraînement ML
```bash
# Création et activation de l'environnement virtuel
python -m venv .venv

# Sur Windows :
.venv\Scripts\activate
# Sur Linux/macOS :
source .venv/bin/activate

# Installation des dépendances ML
pip install -r ml/requirements.txt

# Entraînement et benchmark (utilise le fichier dans data/ ou génère des données calibrées)
python ml/train.py

# Générer un fichier CSV d'échantillons de test
python ml/generate_sample_csv.py --out data/sample_traffic.csv --rows 100
```

### 3. Démarrer l'API Backend (FastAPI)
```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
- API accessible sur : `http://localhost:8000`
- Documentation interactive OpenAPI / Swagger : `http://localhost:8000/docs`

### 4. Démarrer l'Interface Frontend (React + Vite)
Dans un second terminal :
```bash
cd frontend
npm install
npm run dev
```
- Interface utilisateur accessible sur : `http://localhost:5173`

---

## Déploiement sur Vercel

Le projet est préconfiguré pour un déploiement instantané sur **Vercel**.

### Configuration Frontend sur Vercel

1. Importez votre dépôt GitHub `Attack-Watcher` sur [Vercel](https://vercel.com).
2. Configurez le projet :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `./` (ou `frontend` si vous déployez le sous-dossier uniquement)
   - **Build Command** : `cd frontend && npm install && npm run build` (ou `npm run build` si Root Directory est `frontend`)
   - **Output Directory** : `frontend/dist` (ou `dist`)
3. **Variables d'environnement (Environment Variables)** dans les paramètres Vercel :
   - Ajoutez la variable suivante :
     ```text
     VITE_API_BASE_URL = https://votre-backend-fastapi.onrender.com/api
     ```
     *(Remplacez par l'URL publique où votre API FastAPI est hébergée sur Render, Railway, Fly.io ou votre serveur).*

Le fichier `vercel.json` inclus prend en charge automatiquement le routage SPA pour éviter toute erreur 404 lors des rafraîchissements de page.

---

## Tests et Qualité de Code

```bash
# Tests unitaires et d'intégration backend (Pytest)
pytest backend/tests -v

# Analyse statique et linting du backend (Ruff)
ruff check backend

# Linting du frontend (ESLint)
cd frontend
npm run lint

# Validation de la compilation de production (Vite)
npm run build
```

---

## Intégration Continue (CI)

Le fichier `.github/workflows/ci.yml` exécute les vérifications automatisées à chaque `push` et `pull_request` :
- **Backend** : Contrôle de syntaxe Ruff et exécution de l'ensemble des 9 tests Pytest sur Python 3.13 avec mise en cache des dépendances `pip`.
- **Frontend** : Installation `npm ci`, validation ESLint (0 erreur, 0 avertissement) et compilation de production Vite sur Node.js LTS avec mise en cache `npm`.

---

## Licence

Ce projet est sous licence **MIT**. Consultez le fichier [LICENSE](LICENSE) pour obtenir l'intégralité des termes et conditions d'utilisation.

Copyright (c) 2026 Mohammed-ES.
