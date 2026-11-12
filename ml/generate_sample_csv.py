"""
Générateur d'échantillons de logs réseau au format CIC-IDS2017
Permet de créer des fichiers de test pour l'API et le frontend.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np
import pandas as pd


def creer_echantillon(nb_lignes: int = 50, avec_label: bool = True) -> pd.DataFrame:
    """Génère un mix de flux normaux et d'attaques DDoS."""
    np.random.seed(123)
    n_benign = int(nb_lignes * 0.6)
    n_ddos = nb_lignes - n_benign

    benign = {
        "Destination Port": np.random.choice([80, 443, 8080, 53], size=n_benign),
        "Flow Duration": np.random.randint(10000, 5000000, size=n_benign),
        "Total Fwd Packets": np.random.randint(2, 20, size=n_benign),
        "Total Backward Packets": np.random.randint(2, 25, size=n_benign),
        "Total Length of Fwd Packets": np.random.randint(100, 3000, size=n_benign),
        "Total Length of Bwd Packets": np.random.randint(200, 8000, size=n_benign),
        "Bwd Packet Length Std": np.round(np.random.uniform(10.0, 350.0, size=n_benign), 2),
        "Flow Packets/s": np.round(np.random.uniform(0.5, 80.0, size=n_benign), 2),
        "Flow IAT Mean": np.round(np.random.uniform(5000.0, 250000.0, size=n_benign), 2),
        "ACK Flag Count": np.random.choice([0, 1], size=n_benign, p=[0.2, 0.8]),
    }
    if avec_label:
        benign["Label"] = ["BENIGN"] * n_benign

    ddos = {
        "Destination Port": np.random.choice([80, 8080], size=n_ddos, p=[0.95, 0.05]),
        "Flow Duration": np.random.randint(100, 10000, size=n_ddos),
        "Total Fwd Packets": np.random.randint(10, 50, size=n_ddos),
        "Total Backward Packets": np.random.choice([0, 1], size=n_ddos, p=[0.9, 0.1]),
        "Total Length of Fwd Packets": np.random.randint(500, 4000, size=n_ddos),
        "Total Length of Bwd Packets": np.random.choice([0, 40], size=n_ddos, p=[0.9, 0.1]),
        "Bwd Packet Length Std": np.random.choice([0.0, 5.0], size=n_ddos, p=[0.9, 0.1]),
        "Flow Packets/s": np.round(np.random.uniform(500.0, 5000.0, size=n_ddos), 2),
        "Flow IAT Mean": np.round(np.random.uniform(1.0, 200.0, size=n_ddos), 2),
        "ACK Flag Count": np.random.choice([0, 1], size=n_ddos, p=[0.9, 0.1]),
    }
    if avec_label:
        ddos["Label"] = ["DDoS"] * n_ddos

    df_benign = pd.DataFrame(benign)
    df_ddos = pd.DataFrame(ddos)
    df = pd.concat([df_benign, df_ddos], ignore_index=True)
    return df.sample(frac=1.0, random_state=123).reset_index(drop=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Générateur de fichier CSV d'exemple pour Attack Watcher")
    parser.add_argument("--out", type=Path, default=Path("data/sample_traffic.csv"), help="Chemin du fichier de sortie")
    parser.add_argument("--rows", type=int, default=50, help="Nombre de lignes à générer")
    parser.add_argument("--no-label", action="store_true", help="Omettre la colonne Label")
    args = parser.parse_args()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    df = creer_echantillon(nb_lignes=args.rows, avec_label=not args.no_label)
    df.to_csv(args.out, index=False)
    print(f"[✔] Échantillon de {len(df)} lignes généré avec succès dans : {args.out}")


if __name__ == "__main__":
    main()

