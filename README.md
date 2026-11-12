# Attack Watcher 🛡️⚡

**Attack Watcher** est une application web moderne et réactive permettant de détecter des attaques par déni de service distribué (**DDoS**) en temps réel à l'aide de modèles d'apprentissage automatique (**Machine Learning**).

---

## 🚀 Fonctionnalités Clés

1. **Saisie manuelle & Prédiction instantanée** : Saisie des métriques réseau (8 à 10 features clés du flux réseau) avec verdict immédiat (**Normal** en vert ou **Attaque DDoS** en rouge) et probabilité associée.
2. **Import & Analyse de fichiers CSV** :
   - Analyse par lot de flux réseau.
   - Résumé statistique (total analysé, volume d'attaques, taux d'attaque).
   - Tableau paginé avec tri et filtrage.
   - Graphique de répartition visuelle interactif (Recharts).
3. **Export des résultats** : Téléchargement du rapport d'analyse enrichi des prédictions au format CSV.
4. **Pipeline ML robuste** : Entraînement et benchmark entre **Random Forest** et **XGBoost** sur le dataset de référence **CIC-IDS2017**, avec scaling strict post-split stratifié afin d'éviter toute fuite de données (*data leakage*).
5. **Intégration Continue (CI)** : Validation automatique du code (linting ruff/eslint, tests unitaires backend pytest, build frontend) via GitHub Actions.

---

## 🛠️ Stack Technique

- **Machine Learning** : Python 3.13, Pandas, NumPy, Scikit-Learn, XGBoost, Joblib
- **Backend API** : FastAPI, Uvicorn, Pydantic v2, Python-Multipart
- **Frontend** : React 18 / 19, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Dataset de référence** : [CIC-IDS2017](https://www.unb.ca/cic/datasets/ids-2017.html) (`Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv`)

---

## 📂 Structure du Projet

```text
Attack-Watcher/
├── ml/                      # Scripts d'entraînement ML et artefacts
│   ├── train.py             # Script complet : nettoyage, split stratifié, benchmark, export
│   └── artifacts/           # Modèle entraîné (.joblib), scaler (.joblib) et features (.json)
├── backend/                 # API REST FastAPI
│   ├── app/
│   │   ├── main.py          # Point d'entrée de l'API & routes
│   │   ├── schemas.py       # Modèles Pydantic de validation
│   │   └── predictor.py     # Chargement des artefacts et logique d'inférence
│   ├── tests/               # Tests unitaires Pytest (/predict, /predict-csv)
│   └── requirements.txt     # Dépendances Python backend
├── frontend/                # Application Web React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # Composants UI réutilisables (Formulaire, Table, Graphiques)
│   │   ├── App.jsx          # Page principale et gestion d'état
│   │   └── main.jsx         # Point d'entrée React
│   ├── package.json
│   └── tailwind.config.js
├── data/                    # Répertoire des datasets bruts (ignoré par Git)
├── .github/
│   └── workflows/
│       └── ci.yml           # Pipeline GitHub Actions (Backend & Frontend)
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Démarrage Rapide

### 1. Prérequis
- Python 3.13+
- Node.js LTS (v20+) & npm
- Git

### 2. Données d'entraînement (Optionnel pour lancer le train ML)
Placez le fichier `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv` dans le dossier `data/` :
```bash
# Exemple :
data/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv
```
*(Ce dossier et les fichiers CSV sont automatiquement ignorés par Git pour respecter les quotas et la sécurité).*

### 3. Entraînement ML
```bash
cd ml
pip install -r requirements.txt
python train.py
```
Les artefacts (`model.joblib`, `scaler.joblib`, `features.json`) seront générés dans `ml/artifacts/`.

### 4. Démarrer le Backend FastAPI
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
L'API sera disponible sur `http://localhost:8000` et la documentation interactive sur `http://localhost:8000/docs`.

### 5. Démarrer le Frontend React
```bash
cd frontend
npm install
npm run dev
```
L'interface sera accessible sur `http://localhost:5173`.

---

## 🧪 Tests

```bash
# Tests Backend
cd backend
pytest -v

# Lint Backend
ruff check .

# Build & Lint Frontend
cd frontend
npm run lint
npm run build
```

---

## 📄 Licence

Ce projet est sous licence MIT.
