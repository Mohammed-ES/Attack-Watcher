# Architecture Technique - Attack Watcher

Ce document détaille l'architecture globale, les choix de conception, le pipeline d'apprentissage automatique (Machine Learning) et les flux de données du système **Attack Watcher**.

---

## 1. Vue d'Ensemble du Système

Attack Watcher est structuré selon une architecture modulaire trois tiers :
1. **Couche Présentation (Frontend)** : Interface web réactive construite avec React 19, Vite 8, Tailwind CSS, Framer Motion et Lucide Icons.
2. **Couche Service & Inférence (Backend)** : API REST asynchrone haute performance propulsée par FastAPI et Pydantic v2.
3. **Couche Apprentissage & Artefacts (Machine Learning)** : Pipeline scikit-learn unifié (`SimpleImputer` + `RandomForestClassifier`) entraîné hors-ligne sur les datasets de référence CIC-IDS2017 et CIC-DDoS2019, et sérialisé dans `ml/artifacts/`.

```mermaid
flowchart TD
    subgraph Client["Client Web (React 19 + Vite 8)"]
        UI_Form["Saisie Manuelle (9 Features)"]
        UI_CSV["Import Fichier CSV (Limite 50 Mo)"]
        UI_Benchmark["Section Benchmark & Métriques (/api/model-info)"]
        UI_History["Historique Local (10 analyses)"]
        UI_Export["Téléchargement CSV Enrichi"]
    end

    subgraph Gateway["Serveur Backend (FastAPI)"]
        Router["Routeur & Contrôle CORS"]
        Val["Validation Pydantic v2 & 50 Mo Check"]
        Engine["Moteur d'Inférence AttackPredictor"]
        InfoRoute["GET /api/model-info"]
        HealthRoute["GET /api/health"]
    end

    subgraph ML_Artifacts["Artefacts Machine Learning (ml/artifacts/)"]
        ModelArtifact["model.joblib (Pipeline: SimpleImputer + RandomForestClassifier)"]
        MetaFile["features.json (Métadonnées, Métriques Réelles, Limitations)"]
    end

    UI_Form -->|POST /api/predict| Router
    UI_CSV -->|POST /api/predict-csv| Router
    UI_Benchmark -->|GET /api/model-info| InfoRoute
    Client -->|GET /api/health| HealthRoute
    UI_Export -->|POST /api/download-annotated-csv| Router
    Router --> Val
    Val --> Engine
    InfoRoute -->|Lecture directe| MetaFile
    Engine -.->|Chargement absolu Path(__file__)| ModelArtifact
    Engine -.->|Chargement absolu Path(__file__)| MetaFile
    Engine -->|Prédictions & Probabilités| Client
```

---

## 2. Pipeline Machine Learning

L'entraînement du modèle a été réalisé dans un notebook externe. Les artefacts résultants sont conservés tels quels dans `ml/artifacts/`.

### 2.1. Sélection des 9 Caractéristiques (Sans Destination Port)
La variable `Destination Port` a été retirée pour éviter tout surapprentissage dépendant d'un port spécifique (ex: port 80 ou 443). Le modèle s'appuie strictement sur 9 métriques de dynamique de flux réseau :

| # | Feature | Description | Rôle dans la détection |
| :-: | :--- | :--- | :--- |
| 1 | `Flow Duration` | Durée totale du flux (μs) | Identifie les flux asymétriques ultra-courts ou anormaux. |
| 2 | `Total Fwd Packets` | Nombre de paquets émis | Révèle les volumes massifs de requêtes d'inondation. |
| 3 | `Total Backward Packets` | Nombre de paquets en réponse | Révèle l'absence ou la quasi-absence de réponses du serveur saturé. |
| 4 | `Total Length of Fwd Packets` | Volume total des octets émis | Analyse la charge utile émise par l'émetteur. |
| 5 | `Total Length of Bwd Packets` | Volume total des octets reçus | Mesure la réponse applicative du serveur cible. |
| 6 | `Bwd Packet Length Std` | Écart-type taille paquets retour | Indique une régularité suspecte ou l'absence de trafic retour. |
| 7 | `Flow Packets/s` | Débit moyen en paquets/seconde | Métrique critique d'inondation de paquets (packet storm). |
| 8 | `Flow IAT Mean` | Intervalle moyen entre paquets | Détecte une cadence d'émission anormalement élevée. |
| 9 | `ACK Flag Count` | Présence du drapeau TCP ACK | Analyse le protocole de signalement TCP. |

### 2.2. Composition du Pipeline et Élimination des Fuites (Anti-Leakage)
- **Structure** : `sklearn.pipeline.Pipeline` contenant :
  1. `SimpleImputer(strategy='median')` : Imputation des valeurs manquantes (`NaN`) via la médiane calculée sur le jeu d'entraînement.
  2. `RandomForestClassifier(class_weight='balanced', max_depth=20, min_samples_leaf=5, n_jobs=-1, random_state=42)` : Forêt d'arbres décisionnels.
- **Absence de Scaler** : Aucun composant de mise à l'échelle n'est appliqué. Les arbres de décision étant naturellement invariants aux changements d'échelle monotones, l'omission du scaler simplifie la chaîne de traitement et élimine toute distorsion statistique.
- **Architecture Dédiée** : Le modèle de production est exclusivement le `RandomForestClassifier`.
- **Étanchéité des Données** : L'entraînement et le test ont été conduits sur des sous-ensembles et fichiers strictement disjoints. L'imputation est encapsulée dans le pipeline et ajustée (`fit`) uniquement sur le train set.

### 2.3. Évaluation Réelle sur Test Externe
Les métriques proviennent directement de l'évaluation sur le jeu de test externe réservé (documentées dans `ml/artifacts/features.json`) :
- **Jeu Global (5 374 929 flux)** :
  - Exactitude (Accuracy) : 99.61 %
  - Précision DDoS : 99.93 %
  - Rappel DDoS : 99.61 %
  - F1-Score DDoS : 99.77 %
  - Matrice de confusion :
    - Vrais Négatifs (TN) : 845 791
    - Faux Positifs (FP) : 3 257
    - Faux Négatifs (FN) : 17 510
    - Vrais Positifs (TP) : 4 508 371
- **Évaluation Normal 2017 Seul (818 484 flux)** :
  - Rappel DDoS : 99.61 %
  - Taux de Faux Positifs : 0.37 %

---

## 3. Architecture Backend (FastAPI)

### 3.1. Organisation des Modules
- `backend/app/main.py` : Contrôleurs de routes, cycle de vie (`lifespan`), middleware CORS et gestion des exceptions HTTP (413, 422, 503).
- `backend/app/config.py` : Résolution des chemins de fichiers au moyen de `pathlib.Path(__file__)` pour assurer un chargement indépendant du répertoire d'exécution, et définition de la limite maximale d'envoi (50 Mo).
- `backend/app/schemas.py` : Définition des schémas Pydantic v2 (contrôle de validation des 9 features, schéma d'inférence unitaire, statistiques de lot, et schéma complet pour `ModelInfoResponse`).
- `backend/app/predictor.py` : Service singleton encapsulant le chargement de `model.joblib` et `features.json`, effectuant le nettoyage vectoriel et calculant les prédictions (`predict`) et probabilités d'attaque (`predict_proba`).

### 3.2. Contrat des Points d'Accès

| Méthode | Route | Description | Code de Réponse Principal |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Diagnostic de santé du service et vérification du chargement du modèle | 200 (OK) / 200 (Degraded si modèle absent) |
| `GET` | `/api/model-info` | Expose l'intégralité des métadonnées de `features.json` sans calcul simulé | 200 (OK) / 503 (Si indisponible) |
| `POST` | `/api/predict` | Classification d'un flux unitaire via les 9 features | 200 (OK) / 422 (Invalide) / 503 (Modèle indisponible) |
| `POST` | `/api/predict-csv` | Classification par lot à partir d'un fichier CSV (50 Mo max) | 200 (OK) / 413 (Trop gros) / 422 (Features manquantes) / 503 |
| `POST` | `/api/download-annotated-csv` | Streaming du fichier CSV enrichi des colonnes de prédiction et de probabilité | 200 (Fichier attaché) / 413 / 422 / 503 |

### 3.3. Règles de Validation et Codes d'Erreur
1. **Features Manquantes (HTTP 422)** :
   Lorsqu'un fichier CSV est téléversé, les noms de colonnes sont nettoyés (`strip()`). Si une ou plusieurs des 9 caractéristiques requises sont absentes, la requête est immédiatement refusée avec le code HTTP 422 et le message détaille explicitement la liste des colonnes manquantes :
   ```json
   {
     "detail": "Colonnes obligatoires manquantes dans le fichier CSV: ['ACK Flag Count', 'Flow IAT Mean']"
   }
   ```
   Les colonnes additionnelles ou superflues présentes dans le CSV sont ignorées sans bloquer le traitement.
2. **Taille Excessif (HTTP 413)** :
   Si le flux dépasse 50 Mo (52 428 800 octets), le serveur interrompt immédiatement le traitement et répond avec le code HTTP 413.
3. **Valeurs Invalides ou Infinies** :
   Les colonnes sélectionnées sont converties via `pd.to_numeric(errors="coerce")`, et les valeurs `+inf` / `-inf` sont remplacées par `np.nan`. Le nombre de lignes contenant au moins une valeur non conforme est reporté dans le champ `error_rows`. Le `SimpleImputer` du pipeline se charge de l'imputation médiane sans échec d'inférence.
4. **Indisponibilité du Modèle (HTTP 503)** :
   Aucun résultat factice ni prédiction simulée n'est produit. Si les artefacts sont introuvables ou corrompus, le statut de santé indique `degraded` et tout appel de prédiction retourne un code HTTP 503 explicite.

---

## 4. Architecture Frontend (React 19 + Vite 8)

### 4.1. Composants d'Interface
- `App.jsx` : Orchestrateur principal intégrant la navigation fluide, le canvas interactif d'arrière-plan, et l'ensemble des sections fonctionnelles.
- `BenchmarkSection.jsx` : Récupère dynamiquement les données depuis `/api/model-info` pour afficher la version, la date d'entraînement, les datasets, les métriques réelles (précision, rappel, F1, accuracy, taux de faux positifs), la matrice de confusion réelle, la mention "Prototype de recherche" et les limitations.
- `ManualPrediction.jsx` : Formulaire de diagnostic unitaire pour les 9 features avec presets validés sur le modèle réel (`Trafic Normal` -> verdict Normal, `Attaque DDoS` -> verdict DDoS).
- `CsvPrediction.jsx` : Zone de dépôt CSV, suivi des lignes analysées, des lignes en erreur, et gestion de l'historique des 10 dernières analyses stocké en état local.
- `MetricsOverview.jsx` & `ResultsTable.jsx` : Synthèse globale du lot et tableau paginable affichant pour chaque flux le verdict et la probabilité DDoS continue.
- `FaqSection.jsx` : Réponses techniques exactes alignées avec l'architecture réelle (anti-leakage, 9 features, SimpleImputer, absence de mise à l'échelle et modèle dédié).

### 4.2. Absence Totale de Données Simulées
Le service `frontend/src/services/api.js` communique exclusivement avec les points d'accès du backend FastAPI. Tout échec réseau ou code d'erreur HTTP (413, 422, 503) est intercepté et affiché clairement à l'utilisateur sans bascule vers un algorithme simulé ou un faux résultat.

---

## 5. Limites et Périmètre Opérationnel

Conformément à la documentation officielle des artefacts :
1. **Prototype de recherche** : Non validé pour un déploiement en production industrielle.
2. **Famille d'attaques** : Les attaques réservées au test appartiennent aux mêmes familles que celles de l'entraînement (DrDoS) ; la généralisation à d'autres types d'attaques non volumétriques n'est pas mesurée.
3. **Attaques exclues** : Les attaques applicatives ciblées sans volume anormal ou sans signature volumétrique (PortScan, Bot, Web Attack, FTP-Patator, Slowloris) sont expressément hors du champ de détection de ce modèle.
