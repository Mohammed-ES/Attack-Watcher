# Attack Watcher

Plateforme d'analyse et de détection d'attaques DDoS par Machine Learning en temps réel.

[![CI - Attack Watcher](https://github.com/Mohammed-ES/Attack-Watcher/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohammed-ES/Attack-Watcher/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.13%20%7C%203.15-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Architecture & Technologies](#architecture--technologies)
- [Jeu de Données et Sources](#jeu-de-données-et-sources)
- [Installation et Démarrage Rapide](#installation-et-démarrage-rapide)
- [Tests et Qualité de Code](#tests-et-qualité-de-code)
- [Intégration Continue (CI)](#intégration-continue-ci)
- [Licence](#licence)

---

## Présentation

**Attack Watcher** est une application web destinée aux équipes de sécurité informatique et aux ingénieurs réseau. Elle permet d'identifier et de classifier les flux de trafic réseau afin de détecter des comportements caractéristiques d'attaques par déni de service distribué (DDoS).

Le système exploite des modèles d'apprentissage automatique supervisé entraînés sur des caractéristiques réseau discriminantes, offrant à la fois une interface d'inférence unitaire pour des tests ciblés et un moteur d'analyse par lot pour le traitement de fichiers de capture au format CSV.

Pour une description exhaustive des choix techniques, consultez le document [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Fonctionnalités Principales

- **Inférence Unitaire en Temps Réel** : Formulaire interactif permettant de renseigner 10 caractéristiques d'un flux réseau et d'obtenir immédiatement le verdict ("Normal" ou "Attaque DDoS"), la probabilité calculée et le degré de certitude.
- **Présélections de Test** : Chargement en un clic de profils de flux représentatifs (trafic légitime ou attaque DDoS confirmée).
- **Analyse par Lot (Fichiers CSV)** : Téléversement de fichiers de capture réseau volumineux avec traitement vectorisé sans latence.
- **Tableau de Bord Statistique** : Synthèse immédiate affichant le total de flux analysés, le nombre de flux normaux, le nombre d'attaques identifiées et le taux global d'infection.
- **Visualisations Interactives** : Graphiques vectoriels détaillant la proportion des flux et la répartition par paliers de probabilité de risque.
- **Tableau d'Exploration Paginé** : Navigation fluide dans les résultats avec recherche textuelle par port, tri et filtrage dynamique par statut.
- **Export des Résultats Enrichis** : Téléchargement du fichier CSV d'origine complété des colonnes de prédiction et de probabilité.

---

## Architecture & Technologies

Le projet s'articule autour de trois modules indépendants et hautement typés :

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
├── frontend/                # Application Web React + Vite
│   ├── src/
│   │   ├── components/      # Composants d'interface modulaires (Lucide Icons, Recharts)
│   │   ├── services/        # Couche de communication client (api.js)
│   │   ├── App.jsx          # Composant principal
│   │   └── main.jsx         # Point d'entrée React
│   ├── vite.config.js       # Configuration Vite avec proxy automatique /api
│   ├── tailwind.config.js   # Configuration de style
│   └── package.json         # Dépendances Node.js (React 19, Recharts 3, Vite 8)
├── data/                    # Répertoire des datasets bruts (ignoré par Git)
├── .github/workflows/
│   └── ci.yml               # Workflow d'intégration continue GitHub Actions
├── ARCHITECTURE.md          # Documentation technique détaillée
├── LICENSE                  # Licence logicielle MIT
├── pytest.ini               # Configuration des tests Python
└── README.md
```

### Stack Technique

| Domaine | Outils et Bibliothèques |
| :--- | :--- |
| **Machine Learning** | Python 3.13 / 3.15, Scikit-Learn, XGBoost, Pandas, NumPy, Joblib |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Qualité & Tests Backend** | Pytest, HTTPX, Ruff |
| **Frontend** | React 19, Vite 8, Recharts 3, Tailwind CSS, Lucide Icons |
| **Qualité Frontend** | ESLint 9 |
| **CI / CD** | GitHub Actions |

---

## Jeu de Données et Sources

Le modèle a été conçu et calibré à partir du jeu de données de référence international **CIC-IDS2017**, produit par le **Canadian Institute for Cybersecurity (CIC)** de l'Université du Nouveau-Brunswick (UNB).

- **Fichier de référence** : `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv`
- **Source officielle du dataset** : [UNB Canadian Institute for Cybersecurity - IDS 2017](https://www.unb.ca/cic/datasets/ids-2017.html)
- **Publication scientifique** :
  > Iman Sharafaldin, Arash Habibi Lashkari, and Ali A. Ghorbani, *"Toward Generating a New Dataset for Security Analysis: Towards Developing Newer Intrusion Detection Datasets"*, Proceedings of the International Conference on Information Systems Security and Privacy (ICISSP), 2018.

*(Le dossier `data/` et les fichiers volumineux `*.csv` sont strictement exclus du suivi Git via `.gitignore` pour préserver l'intégrité du dépôt).*

---

## Installation et Démarrage Rapide

### 1. Prérequis
- Python 3.13 ou ultérieur
- Node.js LTS (v20 ou ultérieur) et npm
- Git

### 2. Cloner le Projet
```bash
git clone https://github.com/Mohammed-ES/Attack-Watcher.git
cd Attack-Watcher
```

### 3. Environnement Python et Entraînement ML
```bash
# Création et activation de l'environnement virtuel
python -m venv .venv
# Sur Windows :
.venv\Scripts\activate
# Sur Linux/macOS :
source .venv/bin/activate

# Installation des dépendances ML
pip install -r ml/requirements.txt

# Entraînement et benchmark (utilise le fichier dans data/ ou bascule en mode synthétique)
python ml/train.py

# Générer un fichier d'échantillons de test
python ml/generate_sample_csv.py --out data/sample_traffic.csv --rows 100
```

### 4. Démarrer l'API Backend (FastAPI)
```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```
- API accessible sur : `http://localhost:8000`
- Documentation interactive OpenAPI / Swagger : `http://localhost:8000/docs`

### 5. Démarrer l'Interface Frontend (React + Vite)
Dans un second terminal :
```bash
cd frontend
npm install
npm run dev
```
- Interface utilisateur accessible sur : `http://localhost:5173`

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
- **Backend** : Contrôle de syntaxe Ruff et exécution de l'ensemble des tests Pytest sur Python 3.13 avec mise en cache des dépendances `pip`.
- **Frontend** : Installation `npm ci`, validation ESLint et compilation de production Vite sur Node.js LTS avec mise en cache `npm`.
- L'entraînement Machine Learning n'est jamais exécuté pendant la CI pour assurer la rapidité et la reproductibilité du pipeline.

---

## Licence

Ce projet est sous licence **MIT**. Consultez le fichier [LICENSE](LICENSE) pour obtenir l'intégralité des termes et conditions d'utilisation.

Copyright (c) 2026 Mohammed-ES.
