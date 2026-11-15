"""
Attack Watcher - Pipeline d'entraînement et de benchmark Machine Learning
Détection d'attaques DDoS sur les jeux de données CIC-IDS2017, CSE-CIC-IDS2018 et CIC-DDoS2019.
Supporte la validation Leave-One-Dataset-Out (LODO) et l'évaluation sur jeu de test externe held-out.
"""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# Chemins absolus de base
BASE_DIR = Path(__file__).resolve().parent.parent

# Configuration par défaut des datasets supportés
DATASET_CONFIG: dict[str, Path] = {
    "CIC-IDS2017": BASE_DIR / "dataset" / "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv",
    "CSE-CIC-IDS2018": BASE_DIR / "dataset" / "CSE-CIC-IDS2018.csv",
    "CIC-DDoS2019": BASE_DIR / "dataset" / "CIC-DDoS2019.csv",
}

# 9 features sélectionnées sans Destination Port (pour limiter la dépendance à la capture réseau)
SELECTED_FEATURES: list[str] = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Bwd Packet Length Std",
    "Flow Packets/s",
    "Flow IAT Mean",
    "ACK Flag Count",
]

FEATURE_DESCRIPTIONS: dict[str, str] = {
    "Flow Duration": "Durée totale du flux réseau (en microsecondes)",
    "Total Fwd Packets": "Nombre total de paquets émis dans le sens aller",
    "Total Backward Packets": "Nombre total de paquets reçus en retour",
    "Total Length of Fwd Packets": "Taille totale cumulée des paquets émis (octets)",
    "Total Length of Bwd Packets": "Taille totale cumulée des paquets reçus (octets)",
    "Bwd Packet Length Std": "Écart-type de la longueur des paquets reçus",
    "Flow Packets/s": "Débit moyen du flux en paquets par seconde",
    "Flow IAT Mean": "Temps moyen d'intervalle d'arrivée des paquets (Flow Inter-Arrival Time)",
    "ACK Flag Count": "Nombre de paquets avec le drapeau TCP ACK activé",
}

# Table de correspondance exhaustive des noms de colonnes hétérogènes entre datasets
COLUMN_MAPPING: dict[str, str] = {
    # Variantes CSE-CIC-IDS2018
    "Tot Fwd Pkts": "Total Fwd Packets",
    "Tot Bwd Pkts": "Total Backward Packets",
    "TotLen Fwd Pkts": "Total Length of Fwd Packets",
    "TotLen Bwd Pkts": "Total Length of Bwd Packets",
    "Bwd Pkt Len Std": "Bwd Packet Length Std",
    "Flow Pkts/s": "Flow Packets/s",
    "Flow IAT Mean": "Flow IAT Mean",
    "ACK Flag Cnt": "ACK Flag Count",
    # Variantes CIC-DDoS2019 / CIC-IDS2017
    "Flow Duration": "Flow Duration",
    "Total Fwd Packets": "Total Fwd Packets",
    "Total Backward Packets": "Total Backward Packets",
    "Total Length of Fwd Packets": "Total Length of Fwd Packets",
    "Total Length of Bwd Packets": "Total Length of Bwd Packets",
    "Bwd Packet Length Std": "Bwd Packet Length Std",
    "Flow Packets/s": "Flow Packets/s",
    "ACK Flag Count": "ACK Flag Count",
    "Label": "Label",
}


def harmoniser_label(val: Any) -> int | None:
    """
    Mappe de manière stricte les libellés réseau :
    - BENIGN / Normal -> 0
    - Toute variante d'attaque DDoS (ex: DDoS, DDOS, DDoS-LOIC-HTTP, etc.) -> 1
    - Autres attaques non-DDoS -> None (exclues de la classification binaire)
    """
    if val is None or pd.isna(val):
        return None
    val_str = str(val).strip()
    val_lower = val_str.lower()

    if val_lower in ("benign", "normal"):
        return 0
    if "ddos" in val_lower:
        return 1
    return None


def charger_et_nettoyer_dataset(chemin: Path, nom_dataset: str, max_lignes: int | None = None) -> pd.DataFrame:
    """
    Charge un dataset CSV, harmonise les colonnes, filtre les labels et nettoie les valeurs aberrantes.
    """
    if not chemin.exists():
        raise FileNotFoundError(f"Fichier introuvable pour {nom_dataset} à l'emplacement : {chemin}")

    print(f"[*] Chargement du dataset {nom_dataset} depuis {chemin}...")
    df = pd.read_csv(chemin, nrows=max_lignes, low_memory=False)

    # 1. Suppression des espaces blancs dans les noms de colonnes
    df.columns = df.columns.str.strip()

    # 2. Renommage des colonnes selon la table d'harmonisation
    df = df.rename(columns=COLUMN_MAPPING)

    # Vérification de la présence de la colonne Label
    if "Label" not in df.columns:
        raise ValueError(f"La colonne 'Label' est introuvable dans {nom_dataset}.")

    # Vérification de la présence des 9 features requises
    manquantes = [f for f in SELECTED_FEATURES if f not in df.columns]
    if manquantes:
        raise ValueError(f"Features obligatoires manquantes dans {nom_dataset} : {manquantes}")

    # Conservation stricte des 9 features + Label
    df = df[SELECTED_FEATURES + ["Label"]].copy()

    # 3. Suppression des doublons
    nb_avant_doublons = len(df)
    df = df.drop_duplicates()
    nb_doublons = nb_avant_doublons - len(df)
    if nb_doublons > 0:
        print(f"    - {nb_doublons} doublons supprimés.")

    # 4. Remplacement de inf et -inf par NaN sur les colonnes numériques
    for col in SELECTED_FEATURES:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df[SELECTED_FEATURES] = df[SELECTED_FEATURES].replace([np.inf, -np.inf], np.nan)

    # 5. Harmonisation des labels et exclusion des attaques hors-périmètre DDoS
    df["Label_Binaire"] = df["Label"].apply(harmoniser_label)
    nb_avant_filtre = len(df)
    df = df[df["Label_Binaire"].notna()].copy()
    nb_exclus = nb_avant_filtre - len(df)
    if nb_exclus > 0:
        print(f"    - {nb_exclus} lignes hors périmètre DDoS exclues.")

    df["Label"] = df["Label_Binaire"].astype(int)
    df = df.drop(columns=["Label_Binaire"])

    # Étiqueter le dataset d'origine pour la traçabilité LODO
    df["Dataset_Source"] = nom_dataset

    print(f"    - {len(df)} enregistrements valides conservés pour {nom_dataset}.")
    return df


def exporter_model_bundle_json(champion_pipeline: Pipeline, chemin_sortie: Path) -> None:
    """
    Exporte les poids de l'arbre Random Forest et les paramètres du scaler
    au format JSON pour le moteur Edge ML côté client.
    """
    scaler = champion_pipeline.named_steps.get("scaler")
    clf = champion_pipeline.named_steps.get("classifier")

    mean_vals = scaler.mean_.tolist() if hasattr(scaler, "mean_") else [0.0] * len(SELECTED_FEATURES)
    scale_vals = scaler.scale_.tolist() if hasattr(scaler, "scale_") else [1.0] * len(SELECTED_FEATURES)

    trees_json: list[list[dict[str, Any]]] = []
    if isinstance(clf, RandomForestClassifier):
        # Exporter les 100 arbres de décision
        for est in clf.estimators_:
            tree_nodes: list[dict[str, Any]] = []
            tree = est.tree_
            for node_id in range(tree.node_count):
                left_child = int(tree.children_left[node_id])
                right_child = int(tree.children_right[node_id])
                feat_idx = int(tree.feature[node_id])
                thresh = float(tree.threshold[node_id])
                val_counts = tree.value[node_id][0]
                tot = float(np.sum(val_counts))
                prob = float(val_counts[1] / tot) if tot > 0 else 0.0

                tree_nodes.append({
                    "left": left_child,
                    "right": right_child,
                    "feat": feat_idx,
                    "thresh": thresh,
                    "prob": prob,
                })
            trees_json.append(tree_nodes)

    bundle = {
        "features": SELECTED_FEATURES,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "mean": mean_vals,
        "scale": scale_vals,
        "trees": trees_json,
    }

    chemin_sortie.parent.mkdir(parents=True, exist_ok=True)
    with open(chemin_sortie, "w", encoding="utf-8") as f:
        json.dump(bundle, f, ensure_ascii=False)
    print(f"[✔] Bundle Edge ML exporté vers {chemin_sortie}")


def entrainer_et_evaluer(
    datasets_dict: dict[str, pd.DataFrame],
    test_dataset_name: str | None,
    dossier_artefacts: Path,
) -> dict[str, Any]:
    """
    Entraîne les modèles via pipeline étanche (imputation médiane + standardisation sans fuite),
    évalue Random Forest et XGBoost sur le jeu de test externe et sauvegarde le champion.
    """
    dossier_artefacts.mkdir(parents=True, exist_ok=True)

    noms_dispos = list(datasets_dict.keys())
    print("\n" + "=" * 65)
    print(f" PIPELINE D'ENTRAÎNEMENT & VALIDATION : {len(noms_dispos)} DATASETS CHARGÉS")
    print("=" * 65)

    if len(noms_dispos) > 1 and test_dataset_name and test_dataset_name in datasets_dict:
        # Mode Leave-One-Dataset-Out (LODO)
        print("[*] Stratégie de validation : Leave-One-Dataset-Out (LODO)")
        print(f"[*] Dataset de test externe non vu : {test_dataset_name}")
        train_dfs = [df for name, df in datasets_dict.items() if name != test_dataset_name]
        df_train = pd.concat(train_dfs, ignore_index=True)
        df_test = datasets_dict[test_dataset_name].copy()
        validation_strategy = f"Leave-One-Dataset-Out (Test sur {test_dataset_name})"
    else:
        # Mode jeu unique ou partition held-out externe
        print("[*] Stratégie de validation : Split Stratifié Externe (Held-Out Test Set 20%)")
        nom_unique = noms_dispos[0]
        df_total = datasets_dict[nom_unique]
        df_train, df_test = train_test_split(
            df_total, test_size=0.20, random_state=42, stratify=df_total["Label"]
        )
        test_dataset_name = f"{nom_unique} (Held-out Test 20%)"
        validation_strategy = "Stratified Held-Out Test Split (20%)"

    X_train = df_train[SELECTED_FEATURES]
    y_train = df_train["Label"]
    X_test = df_test[SELECTED_FEATURES]
    y_test = df_test["Label"]

    print(f"[*] Volume Train : {len(X_train)} échantillons ({y_train.mean():.2%} DDoS)")
    print(f"[*] Volume Test  : {len(X_test)} échantillons ({y_test.mean():.2%} DDoS)")

    # Définition des pipelines étanches : SimpleImputer + StandardScaler + Classifieur
    # L'imputer et le scaler sont fittés STRICTEMENT sur X_train lors de pipeline.fit()
    pipelines = {
        "RandomForest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(
                n_estimators=100,
                max_depth=12,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1,
            )),
        ]),
        "XGBoost": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
            ("classifier", XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                objective="binary:logistic",
                eval_metric="logloss",
                random_state=42,
                n_jobs=-1,
            )),
        ]),
    }

    resultats: dict[str, Any] = {}

    print("\n" + "=" * 65)
    print(" BENCHMARK COMPARATIF EXÉCUTÉ SUR LE TEST EXTERNE")
    print("=" * 65)

    for nom, pipe in pipelines.items():
        print(f"\n[+] Entraînement de la pipeline {nom}...")
        pipe.fit(X_train, y_train)

        # Prédictions sur le test externe
        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1] if hasattr(pipe, "predict_proba") else None

        p = float(precision_score(y_test, y_pred, zero_division=0))
        r = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc = float(roc_auc_score(y_test, y_prob)) if y_prob is not None else 0.0
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        resultats[nom] = {
            "pipeline": pipe,
            "precision": round(p, 4),
            "recall": round(r, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc, 4),
            "confusion_matrix": {
                "tn": int(tn),
                "fp": int(fp),
                "fn": int(fn),
                "tp": int(tp),
            },
        }

        print(f"--- Résultats réels pour {nom} ---")
        print(f"  - Précision (DDoS) : {p:.4f}")
        print(f"  - Rappel    (DDoS) : {r:.4f}")
        print(f"  - F1-Score  (DDoS) : {f1:.4f}")
        print(f"  - ROC-AUC          : {roc:.4f}")
        print(f"  - Matrice confusion : [TN={tn}, FP={fp}, FN={fn}, TP={tp}]")

    # Sélection du champion sur la base du F1-Score
    nom_champion = max(resultats, key=lambda k: resultats[k]["f1_score"])
    champion_pipeline = resultats[nom_champion]["pipeline"]
    metrics_champion = resultats[nom_champion]

    print("\n" + "=" * 65)
    print(f" 🏆 MODÈLE CHAMPION RETENU : {nom_champion} (F1-Score: {metrics_champion['f1_score']:.4f})")
    print("=" * 65)

    # Construction du bundle d'artefacts complet
    date_iso = datetime.now(UTC).isoformat()
    datasets_utilises = list(datasets_dict.keys())

    artifact_bundle = {
        "model": champion_pipeline,
        "features": SELECTED_FEATURES,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "version": "1.1.0",
        "datasets": datasets_utilises,
        "test_dataset": test_dataset_name,
        "training_date": date_iso,
        "champion_model": nom_champion,
        "validation_strategy": validation_strategy,
        "metrics": {
            "precision": metrics_champion["precision"],
            "recall": metrics_champion["recall"],
            "f1_score": metrics_champion["f1_score"],
            "roc_auc": metrics_champion["roc_auc"],
            "confusion_matrix": metrics_champion["confusion_matrix"],
        },
        "benchmark": {
            k: {
                "precision": v["precision"],
                "recall": v["recall"],
                "f1_score": v["f1_score"],
                "roc_auc": v["roc_auc"],
                "confusion_matrix": v["confusion_matrix"],
            }
            for k, v in resultats.items()
        },
    }

    chemin_modele = dossier_artefacts / "model.joblib"
    chemin_features = dossier_artefacts / "features.json"

    print(f"[*] Sauvegarde de l'artefact unifié vers {chemin_modele}...")
    joblib.dump(artifact_bundle, chemin_modele)

    print(f"[*] Sauvegarde des métadonnées vers {chemin_features}...")
    with open(chemin_features, "w", encoding="utf-8") as f:
        # Exclure l'objet modèle Python brut du fichier JSON
        meta_json = {k: v for k, v in artifact_bundle.items() if k != "model"}
        json.dump(meta_json, f, indent=2, ensure_ascii=False)

    # Exporter également le bundle pour le Edge ML client
    chemin_edge = BASE_DIR / "frontend" / "src" / "services" / "modelBundle.json"
    exporter_model_bundle_json(champion_pipeline, chemin_edge)

    print("[✔] Artefacts réels exportés avec succès !")
    return artifact_bundle


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline d'entraînement ML Attack Watcher")
    parser.add_argument(
        "--cic-ids2017",
        type=Path,
        default=DATASET_CONFIG["CIC-IDS2017"],
        help="Chemin vers le dataset CIC-IDS2017 (CSV)",
    )
    parser.add_argument(
        "--cse-cic-ids2018",
        type=Path,
        default=DATASET_CONFIG["CSE-CIC-IDS2018"],
        help="Chemin vers le dataset CSE-CIC-IDS2018 (CSV)",
    )
    parser.add_argument(
        "--cic-ddos2019",
        type=Path,
        default=DATASET_CONFIG["CIC-DDoS2019"],
        help="Chemin vers le dataset CIC-DDoS2019 (CSV)",
    )
    parser.add_argument(
        "--test-dataset",
        type=str,
        default=None,
        help="Nom du dataset à réserver pour le test en mode LODO (ex: CIC-DDoS2019)",
    )
    parser.add_argument(
        "--artifacts-dir",
        type=Path,
        default=BASE_DIR / "ml" / "artifacts",
        help="Répertoire de destination des artefacts ML",
    )
    parser.add_argument(
        "--sample-size",
        type=int,
        default=None,
        help="Taille maximale d'échantillonnage par dataset (pour tests rapides)",
    )
    args = parser.parse_args()

    candidats = {
        "CIC-IDS2017": args.cic_ids2017,
        "CSE-CIC-IDS2018": args.cse_cic_ids2018,
        "CIC-DDoS2019": args.cic_ddos2019,
    }

    datasets_charges: dict[str, pd.DataFrame] = {}
    for nom, chemin in candidats.items():
        if chemin and chemin.exists():
            try:
                df = charger_et_nettoyer_dataset(chemin, nom, max_lignes=args.sample_size)
                if not df.empty:
                    datasets_charges[nom] = df
            except (ValueError, KeyError, OSError, RuntimeError) as e:
                print(f"[!] Erreur lors du chargement de {nom} : {e}")
        else:
            print(f"[i] Dataset {nom} non configuré ou introuvable à {chemin}")

    if not datasets_charges:
        raise FileNotFoundError(
            "Aucun dataset valide n'a pu être chargé. Assurez-vous qu'au moins un fichier CSV "
            "de dataset (CIC-IDS2017, CSE-CIC-IDS2018 ou CIC-DDoS2019) est présent dans dataset/."
        )

    entrainer_et_evaluer(
        datasets_dict=datasets_charges,
        test_dataset_name=args.test_dataset,
        dossier_artefacts=args.artifacts_dir,
    )


if __name__ == "__main__":
    main()
