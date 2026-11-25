"""
Service de vérification automatisée des rendus de TP (Attack Watcher).
Vérifie le schéma JSON, la cohérence interne des métriques, la reproductibilité
avec model.joblib sur le CSV étudiant, la version scikit-learn et partie7_application.
Ne stocke aucun fichier sur disque après vérification.
"""

from __future__ import annotations

import io
import json
from typing import Any

import joblib
import numpy as np
import pandas as pd

from backend.app.predictor import AttackPredictor, FeatureValidationError

EXPECTED_SKLEARN_VERSION = "1.6.1"
TOLERANCE = 0.0001
METRIC_BLOCKS: tuple[tuple[str, str], ...] = (
    ("partie3_modele_etudiant", "Partie 3 — Modèle de l'étudiant"),
    ("partie4_modele_projet", "Partie 4 — Modèle du projet"),
    ("partie5_anomalie", "Partie 5 — Détection d'anomalie"),
    ("partie6_phishing", "Partie 6 — Détection de phishing"),
)
RATE_KEYS = ("recall", "taux_fp", "accuracy", "precision", "f1", "f1_score")

TP_LIMITATIONS: list[str] = [
    "Les parties 3 (modèle de l'étudiant), 5 (anomalie) et 6 (phishing) ne peuvent être recalculées que pour la cohérence interne.",
    "Les réponses aux questions ne sont pas évaluées automatiquement.",
]


def _is_non_neg_int(val: Any) -> bool:
    return isinstance(val, int) and not isinstance(val, bool) and val >= 0


def _is_rate(val: Any) -> bool:
    return (
        isinstance(val, (int, float))
        and not isinstance(val, bool)
        and not np.isnan(float(val))
        and 0.0 <= float(val) <= 1.0
    )


def _normalize_pred_series(series: pd.Series) -> np.ndarray:
    """Convertit pred_projet en tableau entier 0/1."""
    mapping = {"normal": 0, "benign": 0, "0": 0, "0.0": 0, "ddos": 1, "1": 1, "1.0": 1}
    result = np.empty(len(series), dtype=int)
    for idx, val in enumerate(series):
        if pd.isna(val):
            raise FeatureValidationError(
                f"Valeur manquante dans 'pred_projet' à la ligne {idx + 1}."
            )
        if isinstance(val, (int, float, np.integer, np.floating)) and not isinstance(val, bool):
            int_val = int(val)
            if int_val in (0, 1) and float(val) == float(int_val):
                result[idx] = int_val
                continue
        key = str(val).strip().lower()
        if key in mapping:
            result[idx] = mapping[key]
            continue
        raise FeatureValidationError(
            f"Valeur invalide dans 'pred_projet' à la ligne {idx + 1} : {val!r} (attendu 0/1 ou Normal/DDoS)."
        )
    return result


def _load_model_for_verification(predictor: AttackPredictor) -> Any:
    """Recharge model.joblib depuis le disque pour vérifier la reproductibilité."""
    return joblib.load(predictor.model_path)


def verify_tp_submission(
    json_bytes: bytes,
    csv_bytes: bytes,
    predictor: AttackPredictor,
) -> dict[str, Any]:
    """
    Exécute les 5 étapes de vérification sur les fichiers TP envoyés en mémoire.
    Lève FeatureValidationError (422) si le JSON est illisible ou si le CSV a des colonnes manquantes.
    """
    # Lecture et parsing JSON
    try:
        data = json.loads(json_bytes.decode("utf-8"))
    except Exception as exc:
        raise FeatureValidationError(f"Fichier JSON invalide ou illisible : {exc}") from exc

    if not isinstance(data, dict):
        raise FeatureValidationError("Le fichier JSON doit contenir un objet à la racine.")

    # Lecture et validation des colonnes CSV
    try:
        df = pd.read_csv(io.BytesIO(csv_bytes), low_memory=False)
    except Exception as exc:
        raise FeatureValidationError(f"Impossible de lire le fichier CSV : {exc}") from exc

    if df.empty:
        raise FeatureValidationError("Le fichier CSV fourni est vide.")

    df.columns = df.columns.str.strip()
    required_csv_cols = [*predictor.feature_names, "Label", "pred_projet"]
    missing_cols = [col for col in required_csv_cols if col not in df.columns]
    if missing_cols:
        raise FeatureValidationError(
            f"Colonnes requises manquantes dans le fichier CSV : {missing_cols}. "
            f"Colonnes attendues : {required_csv_cols}"
        )

    checks: list[dict[str, Any]] = []

    # 1. Schéma du JSON : clés obligatoires, types, valeurs entre 0 et 1 pour les taux
    schema_errors: list[str] = []
    required_top_keys = [
        "sklearn_version",
        *[k for k, _ in METRIC_BLOCKS],
        "partie7_application",
    ]
    for key in required_top_keys:
        if key not in data:
            schema_errors.append(f"Clé obligatoire manquante : '{key}'")

    if "sklearn_version" in data and not isinstance(data["sklearn_version"], str):
        schema_errors.append("'sklearn_version' doit être une chaîne de caractères")

    for block_key, _ in METRIC_BLOCKS:
        if block_key not in data:
            continue
        block = data[block_key]
        if not isinstance(block, dict):
            schema_errors.append(f"'{block_key}' doit être un objet JSON")
            continue
        for count_key in ("vp", "fp", "vn", "fn"):
            if count_key not in block or not _is_non_neg_int(block[count_key]):
                schema_errors.append(f"'{block_key}.{count_key}' doit être un entier >= 0")
        for rate_req in ("recall", "taux_fp"):
            if rate_req not in block or not _is_rate(block[rate_req]):
                schema_errors.append(f"'{block_key}.{rate_req}' doit être un nombre entre 0 et 1")
        for opt_rate in RATE_KEYS:
            if opt_rate in block and not _is_rate(block[opt_rate]):
                schema_errors.append(f"'{block_key}.{opt_rate}' doit être un nombre entre 0 et 1")

    if "partie7_application" in data and not isinstance(data["partie7_application"], dict):
        schema_errors.append("'partie7_application' doit être un objet JSON")

    schema_passed = len(schema_errors) == 0
    checks.append({
        "id": "schema_json",
        "label": "1. Schéma du JSON",
        "passed": schema_passed,
        "status": "pass" if schema_passed else "fail",
        "numeric": True,
        "detail": (
            "Toutes les clés obligatoires, types et bornes [0, 1] sont conformes."
            if schema_passed
            else "Erreurs de schéma : " + " ; ".join(schema_errors)
        ),
    })

    # 2. Cohérence interne : recall = vp/(vp+fn) et taux_fp = fp/(fp+vn) à 0,0001 près
    for block_key, block_label in METRIC_BLOCKS:
        block = data.get(block_key)
        if not isinstance(block, dict) or not all(
            k in block and _is_non_neg_int(block[k]) for k in ("vp", "fp", "vn", "fn")
        ) or not all(k in block and _is_rate(block[k]) for k in ("recall", "taux_fp")):
            checks.append({
                "id": f"coherence_{block_key}",
                "label": f"2. Cohérence interne — {block_label}",
                "passed": False,
                "status": "fail",
                "numeric": True,
                "detail": f"Bloc '{block_key}' absent ou invalide pour le calcul de cohérence.",
            })
            continue

        vp, fp, vn, fn = block["vp"], block["fp"], block["vn"], block["fn"]
        recall_val = float(block["recall"])
        taux_fp_val = float(block["taux_fp"])

        block_issues: list[str] = []
        if vp + fn == 0:
            block_issues.append("vp + fn = 0 (impossible de vérifier recall)")
        else:
            expected_recall = vp / (vp + fn)
            if abs(recall_val - expected_recall) > TOLERANCE:
                block_issues.append(
                    f"recall déclaré={recall_val:.4f} vs attendu={expected_recall:.4f} (écart > {TOLERANCE})"
                )

        if fp + vn == 0:
            block_issues.append("fp + vn = 0 (impossible de vérifier taux_fp)")
        else:
            expected_taux_fp = fp / (fp + vn)
            if abs(taux_fp_val - expected_taux_fp) > TOLERANCE:
                block_issues.append(
                    f"taux_fp déclaré={taux_fp_val:.4f} vs attendu={expected_taux_fp:.4f} (écart > {TOLERANCE})"
                )

        ok = len(block_issues) == 0
        checks.append({
            "id": f"coherence_{block_key}",
            "label": f"2. Cohérence interne — {block_label}",
            "passed": ok,
            "status": "pass" if ok else "fail",
            "numeric": True,
            "detail": (
                f"recall={recall_val:.4f} et taux_fp={taux_fp_val:.4f} cohérents à {TOLERANCE} près."
                if ok
                else "Incohérence : " + " ; ".join(block_issues)
            ),
        })

    # 3. Modèle utilisé : rechargement model.joblib, comparaison avec pred_projet et matrice partie4
    X = df[predictor.feature_names].copy()
    for col in predictor.feature_names:
        X[col] = pd.to_numeric(X[col], errors="coerce")
    X = X.replace([np.inf, -np.inf], np.nan)

    reloaded_pipeline = _load_model_for_verification(predictor)
    model_preds = np.asarray(reloaded_pipeline.predict(X), dtype=int)
    student_preds = _normalize_pred_series(df["pred_projet"])

    total_rows = len(df)
    matching_rows = int(np.sum(model_preds == student_preds))
    repro_ok = matching_rows == total_rows
    repro_pct = round((matching_rows / total_rows) * 100.0, 2) if total_rows > 0 else 0.0

    checks.append({
        "id": "reproductibilite_modele",
        "label": "3a. Modèle utilisé — Reproductibilité pred_projet",
        "passed": repro_ok,
        "status": "pass" if repro_ok else "fail",
        "numeric": True,
        "detail": (
            f"100% identique ({matching_rows}/{total_rows} lignes concordantes avec model.joblib)."
            if repro_ok
            else f"Écart détecté : {matching_rows}/{total_rows} lignes identiques ({repro_pct}%)."
        ),
    })

    # Recalcul de la matrice de confusion à partir de Label (BENIGN = 0, autre = 1)
    labels_clean = df["Label"].astype(str).str.strip().str.upper()
    y_true = np.where(labels_clean == "BENIGN", 0, 1)

    calc_vp = int(np.sum((y_true == 1) & (model_preds == 1)))
    calc_fp = int(np.sum((y_true == 0) & (model_preds == 1)))
    calc_vn = int(np.sum((y_true == 0) & (model_preds == 0)))
    calc_fn = int(np.sum((y_true == 1) & (model_preds == 0)))
    recomputed_cm = {"vp": calc_vp, "fp": calc_fp, "vn": calc_vn, "fn": calc_fn}

    p4 = data.get("partie4_modele_projet")
    if isinstance(p4, dict) and all(k in p4 for k in ("vp", "fp", "vn", "fn")):
        cm_match = (
            p4["vp"] == calc_vp
            and p4["fp"] == calc_fp
            and p4["vn"] == calc_vn
            and p4["fn"] == calc_fn
        )
        cm_detail = (
            f"Matrice partie4_modele_projet exacte (VP={calc_vp}, FP={calc_fp}, VN={calc_vn}, FN={calc_fn})."
            if cm_match
            else (
                f"Écart sur partie4_modele_projet : déclaré (VP={p4['vp']}, FP={p4['fp']}, "
                f"VN={p4['vn']}, FN={p4['fn']}) vs recalculé (VP={calc_vp}, FP={calc_fp}, "
                f"VN={calc_vn}, FN={calc_fn})."
            )
        )
    else:
        cm_match = False
        cm_detail = "Bloc partie4_modele_projet absent ou incomplet pour comparaison."

    checks.append({
        "id": "matrice_partie4",
        "label": "3b. Matrice de confusion — Comparaison partie4_modele_projet",
        "passed": cm_match,
        "status": "pass" if cm_match else "fail",
        "numeric": True,
        "detail": cm_detail,
    })

    # 4. Avertissement si sklearn_version diffère de 1.6.1
    declared_sklearn = str(data.get("sklearn_version", "")).strip()
    sklearn_ok = declared_sklearn == EXPECTED_SKLEARN_VERSION
    checks.append({
        "id": "sklearn_version",
        "label": "4. Version scikit-learn",
        "passed": True,
        "status": "pass" if sklearn_ok else "warning",
        "numeric": False,
        "detail": (
            f"Version conforme ({EXPECTED_SKLEARN_VERSION})."
            if sklearn_ok
            else f"Avertissement : version déclarée '{declared_sklearn or 'absente'}' différente de '{EXPECTED_SKLEARN_VERSION}'."
        ),
    })

    # 5. Signalement des champs partie7_application laissés vides
    p7 = data.get("partie7_application")
    empty_p7_fields: list[str] = []
    if not isinstance(p7, dict) or len(p7) == 0:
        p7_status = "warning"
        p7_detail = "Section partie7_application absente ou vide."
    else:
        for k, v in p7.items():
            if v is None or (isinstance(v, str) and v.strip() == "") or (isinstance(v, (list, dict)) and len(v) == 0):
                empty_p7_fields.append(k)
        if empty_p7_fields:
            p7_status = "warning"
            p7_detail = f"Champs laissés vides dans partie7_application : {', '.join(empty_p7_fields)}."
        else:
            p7_status = "pass"
            p7_detail = f"Tous les champs de partie7_application sont renseignés ({len(p7)} champ(s))."

    checks.append({
        "id": "partie7_application",
        "label": "5. Champs partie7_application",
        "passed": True,
        "status": p7_status,
        "numeric": False,
        "detail": p7_detail,
    })

    # Score sur les critères numériques uniquement
    numeric_checks = [c for c in checks if c["numeric"]]
    score = sum(1 for c in numeric_checks if c["passed"])
    max_score = len(numeric_checks)
    percentage = round((score / max_score) * 100.0, 1) if max_score > 0 else 0.0

    # Extraction des métriques par partie pour affichage UI (aucune valeur codée en dur)
    metrics_by_part: list[dict[str, Any]] = []
    for block_key, block_label in METRIC_BLOCKS:
        block = data.get(block_key)
        if isinstance(block, dict):
            metrics_by_part.append({
                "key": block_key,
                "label": block_label,
                "vp": block.get("vp"),
                "fp": block.get("fp"),
                "vn": block.get("vn"),
                "fn": block.get("fn"),
                "recall": block.get("recall"),
                "taux_fp": block.get("taux_fp"),
                "accuracy": block.get("accuracy"),
                "precision": block.get("precision"),
                "f1": block.get("f1", block.get("f1_score")),
            })

    return {
        "etudiant": str(data.get("etudiant") or data.get("nom") or "").strip() or None,
        "sklearn_version": declared_sklearn or None,
        "score": score,
        "max_score": max_score,
        "percentage": percentage,
        "all_numeric_passed": score == max_score,
        "total_csv_rows": total_rows,
        "checks": checks,
        "metrics_by_part": metrics_by_part,
        "recomputed_confusion_matrix": recomputed_cm,
        "empty_partie7_fields": empty_p7_fields,
        "limitations": TP_LIMITATIONS,
    }
