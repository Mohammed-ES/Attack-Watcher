"""
Générateur d'échantillons de logs réseau au format CIC-IDS2017
Extrait des flux réels vérifiés (Benign et DDoS) depuis le dataset source pour les tests.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import pandas as pd

from ml.train import SELECTED_FEATURES, harmoniser_label

DATASET_DEFAULT = Path("dataset/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv")


def extraire_echantillon_reel(
    chemin_source: Path = DATASET_DEFAULT,
    nb_lignes: int = 50,
    avec_label: bool = True,
) -> pd.DataFrame:
    """Extrait un échantillon équilibré de flux réels sans Destination Port."""
    if not chemin_source.exists():
        raise FileNotFoundError(f"Dataset introuvable pour extraction : {chemin_source}")

    df = pd.read_csv(chemin_source, low_memory=False)
    df.columns = df.columns.str.strip()

    # Nettoyage et harmonisation des labels
    df["Label_Binaire"] = df["Label"].apply(harmoniser_label)
    df = df[df["Label_Binaire"].notna()].copy()
    df["Label_Harmonise"] = df["Label_Binaire"].map({0: "BENIGN", 1: "DDoS"})

    df_benign = df[df["Label_Binaire"] == 0]
    df_ddos = df[df["Label_Binaire"] == 1]

    n_benign = nb_lignes // 2
    n_ddos = nb_lignes - n_benign

    sample_benign = df_benign.sample(n=min(n_benign, len(df_benign)), random_state=42)
    sample_ddos = df_ddos.sample(n=min(n_ddos, len(df_ddos)), random_state=42)

    colonnes = list(SELECTED_FEATURES)
    if avec_label:
        sample_benign["Label"] = sample_benign["Label_Harmonise"]
        sample_ddos["Label"] = sample_ddos["Label_Harmonise"]
        colonnes.append("Label")

    echantillon = pd.concat([sample_benign[colonnes], sample_ddos[colonnes]], ignore_index=True)
    return echantillon.sample(frac=1.0, random_state=42).reset_index(drop=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Générateur de fichier CSV d'exemple pour Attack Watcher")
    parser.add_argument("--source", type=Path, default=DATASET_DEFAULT, help="Chemin du dataset source")
    parser.add_argument("--out", type=Path, default=Path("data/sample_traffic.csv"), help="Chemin du fichier de sortie")
    parser.add_argument("--rows", type=int, default=50, help="Nombre de lignes à extraire")
    parser.add_argument("--no-label", action="store_true", help="Omettre la colonne Label")
    args = parser.parse_args()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    df = extraire_echantillon_reel(
        chemin_source=args.source,
        nb_lignes=args.rows,
        avec_label=not args.no_label,
    )
    df.to_csv(args.out, index=False)
    print(f"[✔] Échantillon réel de {len(df)} lignes généré avec succès dans : {args.out}")


if __name__ == "__main__":
    main()
