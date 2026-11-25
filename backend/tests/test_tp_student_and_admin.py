"""
Tests d'intégration pour les endpoints étudiants (/api/tp/test-features, /api/tp/submit),
la gestion des jetons révocables, la limite 5/jour (429) et /api/admin/tp-stats.
"""

from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app
from backend.app.tp_store import (
    hash_token,
    init_tp_db,
    record_tp_event,
    register_student_token,
    revoke_student_token,
)

client = TestClient(app)


def _contains_forbidden_key(obj: Any, forbidden: set[str]) -> list[str]:
    found: list[str] = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in forbidden:
                found.append(k)
            found.extend(_contains_forbidden_key(v, forbidden))
    elif isinstance(obj, list):
        for item in obj:
            found.extend(_contains_forbidden_key(item, forbidden))
    return found


@pytest.fixture()
def tp_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    db_path = tmp_path / "tp_test.db"
    labels_path = tmp_path / "labels_secret.csv"
    labels_path.write_text(
        "id,Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count,Label\n"
        "1,73752313,5,9,11613,62,5.3,0.19,5673254.0,1,BENIGN\n"
        "2,248058,2,5,20,11601,3022.5,28.2,41343.0,0,DDoS\n",
        encoding="utf-8",
    )

    monkeypatch.setattr(settings, "TP_DB_PATH", db_path)
    monkeypatch.setattr(settings, "TP_LABELS_PATH", str(labels_path))
    monkeypatch.setattr(settings, "ADMIN_TOKEN", "secret-admin-token")
    monkeypatch.setattr(settings, "STUDENT_TOKENS", "")

    init_tp_db(db_path)
    tok1 = "student-token-1"
    tok2 = "student-token-2"
    register_student_token(tok1, db_path)
    register_student_token(tok2, db_path)

    return {"db_path": db_path, "tok1": tok1, "tok2": tok2}


def test_test_features_and_submit_require_token_401(tp_env: dict[str, Any]) -> None:
    """Sans jeton : 401 sur test-features et submit."""
    res_feat = client.get("/api/tp/test-features")
    assert res_feat.status_code == 401

    res_sub = client.post("/api/tp/submit", json={"predictions": [{"id": 1, "pred": 0}]})
    assert res_sub.status_code == 401


def test_revoked_token_returns_401(tp_env: dict[str, Any]) -> None:
    """Jeton révoqué : 401."""
    revoke_student_token(tp_env["tok1"], tp_env["db_path"])
    headers = {"Authorization": f"Bearer {tp_env['tok1']}"}

    assert client.get("/api/tp/test-features", headers=headers).status_code == 401
    assert (
        client.post(
            "/api/tp/submit",
            headers=headers,
            json={"predictions": [{"id": 1, "pred": 0}]},
        ).status_code
        == 401
    )


def test_test_features_excludes_labels_target_destination_port(tp_env: dict[str, Any]) -> None:
    """Aucune réponse de test-features ne contient Label, Target ou Destination Port."""
    headers = {"Authorization": f"Bearer {tp_env['tok1']}"}
    res = client.get("/api/tp/test-features", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 2
    assert len(data["rows"]) == 2
    forbidden = _contains_forbidden_key(data, {"Label", "Target", "Destination Port", "label", "target"})
    assert forbidden == []


def test_submit_returns_metrics_without_confusion_matrix_and_rate_limits_6th_429(
    tp_env: dict[str, Any],
) -> None:
    """submit ne renvoie jamais de matrice de confusion ; 6e soumission du jour renvoie 429."""
    headers = {"Authorization": f"Bearer {tp_env['tok1']}"}
    payload = {"predictions": [{"id": 1, "pred": 0}, {"id": 2, "pred": 1}]}

    for _ in range(5):
        res = client.post("/api/tp/submit", headers=headers, json=payload)
        assert res.status_code == 200
        body = res.json()
        assert set(body.keys()) == {"recall", "precision", "f1", "taux_fp", "total_predictions"}
        assert body["recall"] == 1.0
        assert body["precision"] == 1.0
        assert body["f1"] == 1.0
        assert body["taux_fp"] == 0.0
        assert "matrice_confusion" not in body
        assert "vp" not in body

    res_6th = client.post("/api/tp/submit", headers=headers, json=payload)
    assert res_6th.status_code == 429


def test_admin_tp_stats_requires_admin_token_401(tp_env: dict[str, Any]) -> None:
    """tp-stats sans ADMIN_TOKEN ou mauvais jeton : 401."""
    assert client.get("/api/admin/tp-stats").status_code == 401
    assert (
        client.get("/api/admin/tp-stats", headers={"Authorization": "Bearer wrong"}).status_code
        == 401
    )


def test_admin_tp_stats_counts_distinct_students(tp_env: dict[str, Any]) -> None:
    """Deux jetons, trois imports verify_ok -> 2 étudiants distincts, 3 imports."""
    db_path = tp_env["db_path"]
    h1 = hash_token(tp_env["tok1"])
    h2 = hash_token(tp_env["tok2"])

    record_tp_event(h1, "verify_ok", db_path)
    record_tp_event(h1, "verify_ok", db_path)
    record_tp_event(h2, "verify_ok", db_path)

    res = client.get(
        "/api/admin/tp-stats",
        headers={"Authorization": "Bearer secret-admin-token"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["distinct_students"] == 2
    assert data["total_imports"] == 3
    assert data["last_24h"]["verify_ok"] == 3


def test_verify_records_event_in_tp_events(tp_env: dict[str, Any]) -> None:
    """Vérifie que /api/tp/verify enregistre bien un événement anonymisé."""
    csv_content = (
        "Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count,Label,pred_projet\n"
        "73752313,5,9,11613,62,5.3,0.19,5673254.0,1,BENIGN,0\n"
        "248058,2,5,20,11601,3022.5,28.2,41343.0,0,DDoS,1\n"
    )
    json_payload = {
        "etudiant": "TEST",
        "sklearn_version": "1.6.1",
        "partie3_modele_etudiant": {"vp": 10, "fp": 0, "vn": 10, "fn": 0, "recall": 1.0, "taux_fp": 0.0},
        "partie4_modele_projet": {"vp": 1, "fp": 0, "vn": 1, "fn": 0, "recall": 1.0, "taux_fp": 0.0},
        "partie5_anomalie": {"vp": 5, "fp": 0, "vn": 5, "fn": 0, "recall": 1.0, "taux_fp": 0.0},
        "partie6_phishing": {"vp": 5, "fp": 0, "vn": 5, "fn": 0, "recall": 1.0, "taux_fp": 0.0},
        "partie7_application": {"verdict_normal": "Normal"},
    }
    files = {
        "json_file": ("resultats_TP_TEST.json", io.BytesIO(json.dumps(json_payload).encode("utf-8")), "application/json"),
        "csv_file": ("predictions_TP_TEST.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv"),
    }
    res = client.post(
        "/api/tp/verify",
        files=files,
        headers={"X-Student-Token": tp_env["tok1"]},
    )
    assert res.status_code == 200
    stats = client.get(
        "/api/admin/tp-stats",
        headers={"X-Admin-Token": "secret-admin-token"},
    ).json()
    assert stats["distinct_students"] == 1
    assert stats["total_imports"] == 1
