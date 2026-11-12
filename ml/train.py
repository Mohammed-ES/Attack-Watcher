"""
Attack Watcher - Pipeline d'entraînement et de benchmark Machine Learning
Détection d'attaques DDoS sur le jeu de données CIC-IDS2017.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

# Liste des 10 features réseau les plus discriminantes pour le trafic DDoS
SELECTED_FEATURES: List[str] = [
    "Destination Port",
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

FEATURE_DESCRIPTIONS: Dict[str, str] = {
    "Destination Port": "Port de destination du flux réseau (ex: 80, 443)",
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


def generer_donnees_synthetiques(n_echantillons: int = 15000) -> pd.DataFrame:
    """
    Génère un jeu de données synthétique calibré sur les distributions
    de trafic réel et d'attaques DDoS du dataset CIC-IDS2017.
    """
    print(f"[*] Génération d'un dataset synthétique de démonstration ({n_echantillons} lignes)...")
    np.random.seed(42)
    n_benign = int(n_echantillons * 0.55)
    n_ddos = n_echantillons - n_benign

    # Profil trafic normal (BENIGN) : ports variés (80, 443, 8080, ports hauts), durées modérées,
    # ratio fwd/bwd équilibré, débit modéré.
    benign_data = {
        "Destination Port": np.random.choice([80, 443, 8080, 53, 22, 3389], size=n_benign, p=[0.4, 0.4, 0.05, 0.05, 0.05, 0.05]),
        "Flow Duration": np.random.exponential(scale=3000000, size=n_benign) + 1000,
        "Total Fwd Packets": np.random.negative_binomial(5, 0.3, size=n_benign) + 1,
        "Total Backward Packets": np.random.negative_binomial(6, 0.35, size=n_benign) + 1,
        "Total Length of Fwd Packets": np.random.gamma(2, 400, size=n_benign) + 40,
        "Total Length of Bwd Packets": np.random.gamma(3, 800, size=n_benign) + 40,
        "Bwd Packet Length Std": np.random.exponential(scale=150, size=n_benign),
        "Flow Packets/s": np.random.exponential(scale=50, size=n_benign) + 0.1,
        "Flow IAT Mean": np.random.exponential(scale=200000, size=n_benign) + 10,
        "ACK Flag Count": np.random.binomial(1, 0.75, size=n_benign),
        "Label": ["BENIGN"] * n_benign,
    }

    # Profil attaque DDoS : inondation ciblée (souvent port 80), durées très courtes ou asymétriques,
    # énorme débit de paquets, quasi aucun paquet de retour (bwd quasi nul), paquets répétitifs.
    ddos_data = {
        "Destination Port": np.random.choice([80, 8080], size=n_ddos, p=[0.9, 0.1]),
        "Flow Duration": np.random.exponential(scale=500000, size=n_ddos) + 500,
        "Total Fwd Packets": np.random.negative_binomial(15, 0.2, size=n_ddos) + 10,
        "Total Backward Packets": np.random.poisson(lam=0.4, size=n_ddos),  # Quasi aucune réponse
        "Total Length of Fwd Packets": np.random.gamma(4, 300, size=n_ddos) + 200,
        "Total Length of Bwd Packets": np.random.choice([0, 40, 80], size=n_ddos, p=[0.8, 0.15, 0.05]),
        "Bwd Packet Length Std": np.random.choice([0.0, 10.0], size=n_ddos, p=[0.85, 0.15]),
        "Flow Packets/s": np.random.exponential(scale=1200, size=n_ddos) + 500,  # Débit massif
        "Flow IAT Mean": np.random.exponential(scale=2000, size=n_ddos) + 1,      # Fréquence ultra rapide
        "ACK Flag Count": np.random.binomial(1, 0.15, size=n_ddos),
        "Label": ["DDoS"] * n_ddos,
    }

    df_benign = pd.DataFrame(benign_data)
    df_ddos = pd.DataFrame(ddos_data)
    df = pd.concat([df_benign, df_ddos], ignore_index=True)
    # Mélange aléatoire
    return df.sample(frac=1.0, random_state=42).reset_index(drop=True)


def charger_et_nettoyer_donnees(chemin_csv: Path, mode_demo: bool = False, max_lignes: int | None = None) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Charge le dataset CIC-IDS2017 (ou génère les données de démo si absent),
    nettoie les colonnes, supprime les inf/NaN et doublons, et encode le Label.
    """
    if mode_demo or not chemin_csv.exists():
        if not mode_demo:
            print(f"[!] Fichier introuvable à l'emplacement : {chemin_csv}")
            print("[*] Bascule automatique vers le mode démonstration synthétique.")
        df = generer_donnees_synthetiques()
    else:
        print(f"[*] Chargement du dataset depuis {chemin_csv}...")
        df = pd.read_csv(chemin_csv, nrows=max_lignes)

    # 1. Suppression des espaces blancs dans les noms de colonnes
    df.columns = df.columns.str.strip()
    print(f"[*] Colonnes présentes : {len(df.columns)} colonnes.")

    # Vérification des colonnes cibles
    col_label = "Label" if "Label" in df.columns else None
    if not col_label:
        raise ValueError("La colonne 'Label' est introuvable dans le dataset.")

    # Conserver uniquement les 10 features sélectionnées + Label
    colonnes_a_garder = [col for col in SELECTED_FEATURES if col in df.columns]
    if len(colonnes_a_garder) < len(SELECTED_FEATURES):
        manquantes = set(SELECTED_FEATURES) - set(colonnes_a_garder)
        raise ValueError(f"Colonnes requises manquantes dans le dataset : {manquantes}")

    df = df[SELECTED_FEATURES + [col_label]].copy()
    print(f"[*] Lignes initiales : {len(df)}")

    # 2. Gestion des valeurs infinies et manquantes
    # Remplacer inf et -inf par NaN, puis supprimer les NaN sans utiliser inplace=True (déprécié dans Pandas 3+)
    df = df.replace([np.inf, -np.inf], np.nan)
    lignes_avant_na = len(df)
    df = df.dropna()
    na_supprimees = lignes_avant_na - len(df)
    if na_supprimees > 0:
        print(f"[*] {na_supprimees} lignes avec NaN ou inf supprimées.")

    # 3. Suppression des doublons (sans inplace=True)
    lignes_avant_doublons = len(df)
    df = df.drop_duplicates()
    doublons_supprimes = lignes_avant_doublons - len(df)
    if doublons_supprimes > 0:
        print(f"[*] {doublons_supprimes} doublons supprimés.")

    # 4. Encodage binaire de la cible (BENIGN = 0, DDoS = 1)
    # Nettoyage d'éventuels espaces dans le label
    df[col_label] = df[col_label].astype(str).str.strip()
    
    # Prise en charge des variantes d'étiquettes (ex: DDoS, Infiltration, etc.)
    # Dans CIC-IDS2017 Friday DDoS, les étiquettes sont généralement "BENIGN" et "DDoS"
    label_binaire = df[col_label].apply(lambda x: 0 if x.upper() == "BENIGN" else 1)
    
    repartition = label_binaire.value_counts(normalize=True).to_dict()
    print(f"[*] Répartition des classes : 0 (BENIGN): {repartition.get(0, 0):.2%}, 1 (DDoS): {repartition.get(1, 0):.2%}")
    print(f"[*] Total final d'échantillons propres : {len(df)}")

    X = df[SELECTED_FEATURES].copy()
    y = label_binaire

    return X, y


def entrainer_et_evaluer(
    X: pd.DataFrame,
    y: pd.Series,
    dossier_artefacts: Path
) -> Tuple[object, StandardScaler, Dict]:
    """
    Exécute le split stratifié AVANT le scaling, entraîne Random Forest et XGBoost,
    affiche le benchmark comparatif et sauvegarde le champion.
    """
    print("\n" + "=" * 60)
    print(" 1. SPLIT STRATIFIÉ (80% Train, 20% Test) & SCALING SANS FUITE")
    print("=" * 60)

    # 1. Split stratifié appliqué strictement AVANT tout scaling pour éviter la fuite de données
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[*] Dimensions Train : {X_train.shape[0]} lignes")
    print(f"[*] Dimensions Test  : {X_test.shape[0]} lignes")

    # 2. Scaling fitté UNIQUEMENT sur le Train set
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 3. Modèles à benchmarker
    modeles = {
        "RandomForest": RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
        ),
    }

    resultats = {}

    print("\n" + "=" * 60)
    print(" 2. ENTRAÎNEMENT & BENCHMARK COMPARATIF")
    print("=" * 60)

    for nom, clf in modeles.items():
        print(f"\n[+] Entraînement de {nom}...")
        clf.fit(X_train_scaled, y_train)

        # Prédictions
        y_pred = clf.predict(X_test_scaled)
        y_prob = clf.predict_proba(X_test_scaled)[:, 1]

        # Métriques
        p = precision_score(y_test, y_pred, zero_division=0)
        r = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        resultats[nom] = {
            "modele": clf,
            "precision": float(p),
            "recall": float(r),
            "f1_score": float(f1),
            "roc_auc": float(roc),
            "confusion_matrix": {
                "tn": int(tn),
                "fp": int(fp),
                "fn": int(fn),
                "tp": int(tp),
            },
        }

        print(f"--- Résultats pour {nom} ---")
        print(f"  - Précision (DDoS) : {p:.4f}")
        print(f"  - Rappel    (DDoS) : {r:.4f}")
        print(f"  - F1-Score  (DDoS) : {f1:.4f}")
        print(f"  - ROC-AUC          : {roc:.4f}")
        print(f"  - Matrice de confusion [TN={tn}, FP={fp}, FN={fn}, TP={tp}]")
        print("\nRapport de classification détaillé :")
        print(classification_report(y_test, y_pred, target_names=["BENIGN", "DDoS"], digits=4))

    # 4. Sélection du modèle champion selon le F1-Score
    nom_champion = max(resultats, key=lambda k: resultats[k]["f1_score"])
    champion = resultats[nom_champion]["modele"]
    stats_champion = resultats[nom_champion]

    print("\n" + "=" * 60)
    print(f" 🏆 MODÈLE CHAMPION RETENU : {nom_champion} (F1-Score: {stats_champion['f1_score']:.4f})")
    print("=" * 60)

    # 5. Sauvegarde des artefacts
    dossier_artefacts.mkdir(parents=True, exist_ok=True)
    chemin_modele = dossier_artefacts / "model.joblib"
    chemin_scaler = dossier_artefacts / "scaler.joblib"
    chemin_features = dossier_artefacts / "features.json"

    print(f"[*] Sauvegarde du modèle vers {chemin_modele}...")
    joblib.dump(champion, chemin_modele)

    print(f"[*] Sauvegarde du scaler vers {chemin_scaler}...")
    joblib.dump(scaler, chemin_scaler)

    metadonnees_features = {
        "features": SELECTED_FEATURES,
        "feature_descriptions": FEATURE_DESCRIPTIONS,
        "target": "Label",
        "label_mapping": {
            0: "Normal",
            1: "Attaque DDoS",
        },
        "champion_model": nom_champion,
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

    print(f"[*] Sauvegarde des métadonnées vers {chemin_features}...")
    with open(chemin_features, "w", encoding="utf-8") as f:
        json.dump(metadonnees_features, f, indent=2, ensure_ascii=False)

    print("[✔] Artefacts générés et sauvegardés avec succès dans ml/artifacts/ !")
    return champion, scaler, metadonnees_features


def main() -> None:
    parser = argparse.ArgumentParser(description="Entraînement et benchmark ML pour Attack Watcher")
    parser.add_argument(
        "--data-path",
        type=Path,
        default=Path("data/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"),
        help="Chemin vers le fichier CSV du dataset CIC-IDS2017",
    )
    parser.add_argument(
        "--artifacts-dir",
        type=Path,
        default=Path("ml/artifacts"),
        help="Répertoire de sauvegarde des artefacts ML",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Forcer l'utilisation de données synthétiques représentatives",
    )
    parser.add_argument(
        "--sample-size",
        type=int,
        default=None,
        help="Nombre maximum de lignes à charger (pour tests rapides)",
    )
    args = parser.parse_args()

    X, y = charger_et_nettoyer_donnees(
        chemin_csv=args.data_path,
        mode_demo=args.demo,
        max_lignes=args.sample_size,
    )
    entrainer_et_evaluer(X, y, args.artifacts_dir)


if __name__ == "__main__":
    main()

