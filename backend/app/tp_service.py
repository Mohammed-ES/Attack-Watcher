"""
Service de chargement du jeu de test sans étiquettes (/api/tp/test-features)
et d'évaluation des prédictions étudiantes (/api/tp/submit).
Les étiquettes sont lues uniquement depuis TP_LABELS_PATH et jamais journalisées.
"""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from backend.app.config import settings
from backend.app.predictor import FeatureValidationError

FORBIDDEN_FEATURE_KEYS = {"Label", "Target", "Destination Port", "label", "target"}


def _resolve_labels_path() -> Path:
    raw = settings.TP_LABELS_PATH.strip()
    if not raw:
        raise FileNotFoundError(
            "La variable d'environnement TP_LABELS_PATH n'est pas configurée."
        )
    path = Path(raw)
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(
            "Le fichier d'étiquettes configuré via TP_LABELS_PATH est introuvable."
        )
    return path


def _read_labels_dataframe() -> pd.DataFrame:
    raw_inline = settings.TP_LABELS_JSON.strip()
    if raw_inline:
        if raw_inline.startswith(("[", "{")):
            df = pd.read_json(io.StringIO(raw_inline))
        else:
            df = pd.read_csv(io.StringIO(raw_inline), low_memory=False)
    else:
        path = _resolve_labels_path()
        if path.suffix.lower() == ".json":
            df = pd.read_json(path)
        else:
            df = pd.read_csv(path, low_memory=False)
    df.columns = df.columns.str.strip()
    if df.empty:
        raise FeatureValidationError("Le fichier de jeu de test TP est vide.")
    return df


def load_test_features(feature_names: list[str], limit: int = 500) -> list[dict[str, Any]]:
    """
    Charge jusqu'à `limit` lignes depuis TP_LABELS_JSON ou TP_LABELS_PATH et retourne uniquement
    `id` et les 9 features requises. Aucune étiquette ni Destination Port.
    """
    df = _read_labels_dataframe().head(limit).copy()

    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        raise FeatureValidationError(
            f"Colonnes manquantes dans le fichier de test : {missing}"
        )

    if "id" in df.columns:
        ids = pd.to_numeric(df["id"], errors="raise").astype(int).tolist()
    else:
        ids = list(range(1, len(df) + 1))

    X = df[feature_names].copy()
    for col in feature_names:
        X[col] = pd.to_numeric(X[col], errors="coerce").replace([np.inf, -np.inf], np.nan)

    rows: list[dict[str, Any]] = []
    for idx, row_id in enumerate(ids):
        item: dict[str, Any] = {"id": int(row_id)}
        for col in feature_names:
            if col in FORBIDDEN_FEATURE_KEYS:
                continue
            val = X.iloc[idx][col]
            item[col] = None if pd.isna(val) else float(val)
        rows.append(item)
    return rows


def _extract_ground_truth(df: pd.DataFrame) -> dict[int, int]:
    label_col = None
    for candidate in ("Label", "label", "Target", "target"):
        if candidate in df.columns:
            label_col = candidate
            break
    if label_col is None:
        raise FeatureValidationError(
            "Colonne d'étiquette introuvable dans le fichier configuré par TP_LABELS_PATH."
        )

    if "id" in df.columns:
        ids = pd.to_numeric(df["id"], errors="raise").astype(int).tolist()
    else:
        ids = list(range(1, len(df) + 1))

    truth: dict[int, int] = {}
    for idx, row_id in enumerate(ids):
        raw = df.iloc[idx][label_col]
        if isinstance(raw, (int, float, np.integer, np.floating)) and not isinstance(raw, bool):
            truth[int(row_id)] = 0 if int(raw) == 0 else 1
        else:
            s = str(raw).strip().upper()
            truth[int(row_id)] = 0 if s in ("BENIGN", "NORMAL", "0") else 1
    return truth


def evaluate_student_submit(predictions: list[dict[str, int]]) -> dict[str, Any]:
    """
    Calcule uniquement recall, précision, F1 et taux de faux positifs.
    Ne renvoie jamais de matrice de confusion ni d'étiquette.
    """
    df = _read_labels_dataframe()
    truth_map = _extract_ground_truth(df)

    seen_ids: set[int] = set()
    vp = fp = vn = fn = 0

    for item in predictions:
        row_id = int(item["id"])
        pred = int(item["pred"])
        if row_id in seen_ids:
            raise FeatureValidationError(f"Identifiant dupliqué dans predictions : {row_id}")
        if row_id not in truth_map:
            raise FeatureValidationError(f"Identifiant inconnu dans predictions : {row_id}")
        seen_ids.add(row_id)

        y_true = truth_map[row_id]
        if y_true == 1 and pred == 1:
            vp += 1
        elif y_true == 0 and pred == 1:
            fp += 1
        elif y_true == 0 and pred == 0:
            vn += 1
        elif y_true == 1 and pred == 0:
            fn += 1

    recall = vp / (vp + fn) if (vp + fn) > 0 else 0.0
    precision = vp / (vp + fp) if (vp + fp) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    taux_fp = fp / (fp + vn) if (fp + vn) > 0 else 0.0

    return {
        "recall": round(recall, 4),
        "precision": round(precision, 4),
        "f1": round(f1, 4),
        "taux_fp": round(taux_fp, 4),
        "total_predictions": len(predictions),
    }
