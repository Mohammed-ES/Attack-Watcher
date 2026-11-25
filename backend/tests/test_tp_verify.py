"""
Tests d'intégration pour l'endpoint POST /api/tp/verify.
Couvre : soumission valide, incohérence de métriques, modèle différent,
colonne manquante (422) et fichier trop volumineux (413).
"""

from __future__ import annotations

import io
import json

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app

client = TestClient(app)


def _build_valid_csv(pred_normal: int = 0, pred_ddos: int = 1) -> str:
    return (
        "Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count,Label,pred_projet\n"
        f"73752313,5,9,11613,62,5.3,0.19,5673254.0,1,BENIGN,{pred_normal}\n"
        f"248058,2,5,20,11601,3022.5,28.2,41343.0,0,DDoS,{pred_ddos}\n"
    )


def _build_valid_json(
    p4_vp: int = 1,
    p4_fp: int = 0,
    p4_vn: int = 1,
    p4_fn: int = 0,
    p4_recall: float = 1.0,
    p4_taux_fp: float = 0.0,
    sklearn_version: str = "1.6.1",
) -> dict:
    return {
        "etudiant": "DUPONT",
        "sklearn_version": sklearn_version,
        "partie3_modele_etudiant": {
            "vp": 90,
            "fp": 5,
            "vn": 95,
            "fn": 10,
            "recall": 0.9,
            "taux_fp": 0.05,
        },
        "partie4_modele_projet": {
            "vp": p4_vp,
            "fp": p4_fp,
            "vn": p4_vn,
            "fn": p4_fn,
            "recall": p4_recall,
            "taux_fp": p4_taux_fp,
        },
        "partie5_anomalie": {
            "vp": 40,
            "fp": 2,
            "vn": 98,
            "fn": 10,
            "recall": 0.8,
            "taux_fp": 0.02,
        },
        "partie6_phishing": {
            "vp": 45,
            "fp": 1,
            "vn": 99,
            "fn": 5,
            "recall": 0.9,
            "taux_fp": 0.01,
        },
        "partie7_application": {
            "verdict_normal": "Normal",
            "verdict_ddos": "DDoS",
            "observations": "Tests effectués via la console.",
        },
    }


def _post_tp(payload_json: dict, csv_text: str):
    json_bytes = json.dumps(payload_json).encode("utf-8")
    csv_bytes = csv_text.encode("utf-8")
    files = {
        "json_file": ("resultats_TP_DUPONT.json", io.BytesIO(json_bytes), "application/json"),
        "csv_file": ("predictions_TP_DUPONT.csv", io.BytesIO(csv_bytes), "text/csv"),
    }
    return client.post("/api/tp/verify", files=files)


def test_tp_verify_valid_submission() -> None:
    """Fichier valide : tous les contrôles doivent passer (✓)."""
    res = _post_tp(_build_valid_json(), _build_valid_csv())
    assert res.status_code == 200
    data = res.json()
    assert data["all_numeric_passed"] is True
    assert data["score"] == data["max_score"]
    assert data["percentage"] == 100.0
    assert all(c["passed"] is True and c["status"] == "pass" for c in data["checks"])
    assert len(data["limitations"]) >= 2


def test_tp_verify_manual_metric_tampering() -> None:
    """Métriques modifiées à la main : échec (✗) sur la cohérence interne."""
    tampered_json = _build_valid_json(p4_recall=0.5)
    res = _post_tp(tampered_json, _build_valid_csv())
    assert res.status_code == 200
    data = res.json()
    assert data["all_numeric_passed"] is False
    checks_by_id = {c["id"]: c for c in data["checks"]}
    assert checks_by_id["coherence_partie4_modele_projet"]["passed"] is False
    assert checks_by_id["coherence_partie4_modele_projet"]["status"] == "fail"


def test_tp_verify_different_model_predictions() -> None:
    """Modèle différent (pred_projet ne correspond pas à model.joblib) : échec (✗) sur la reproductibilité."""
    wrong_csv = _build_valid_csv(pred_normal=1, pred_ddos=0)
    res = _post_tp(_build_valid_json(), wrong_csv)
    assert res.status_code == 200
    data = res.json()
    assert data["all_numeric_passed"] is False
    checks_by_id = {c["id"]: c for c in data["checks"]}
    assert checks_by_id["reproductibilite_modele"]["passed"] is False
    assert checks_by_id["reproductibilite_modele"]["status"] == "fail"


def test_tp_verify_missing_column_422() -> None:
    """Colonne manquante dans le CSV : doit retourner HTTP 422."""
    incomplete_csv = (
        "Flow Duration,Total Fwd Packets,Label,pred_projet\n"
        "73752313,5,BENIGN,0\n"
    )
    res = _post_tp(_build_valid_json(), incomplete_csv)
    assert res.status_code == 422
    assert "Colonnes requises manquantes" in res.json()["detail"]


def test_tp_verify_file_too_large_413() -> None:
    """Fichier > 5 Mo (TP_MAX_UPLOAD_SIZE) : doit retourner HTTP 413."""
    assert settings.TP_MAX_UPLOAD_SIZE == 5 * 1024 * 1024
    oversized_csv = b"a" * (settings.TP_MAX_UPLOAD_SIZE + 1)
    json_bytes = json.dumps(_build_valid_json()).encode("utf-8")
    files = {
        "json_file": ("resultats_TP_DUPONT.json", io.BytesIO(json_bytes), "application/json"),
        "csv_file": ("predictions_TP_DUPONT.csv", io.BytesIO(oversized_csv), "text/csv"),
    }
    res = client.post("/api/tp/verify", files=files)
    assert res.status_code == 413
    assert "trop volumineux" in res.json()["detail"]
