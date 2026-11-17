"""
Suite de tests d'intégration et unitaires pour l'API FastAPI Attack Watcher.
Couvre l'inférence unitaire, par lot, la validation des 9 features (422),
la limite 50 Mo (413), /api/model-info et le comportement 503 si non prêt.
"""

from __future__ import annotations

import io

from fastapi.testclient import TestClient

import backend.app.main as main_module
from backend.app.config import settings
from backend.app.main import app

client = TestClient(app)

# Exemples de flux réels issus du dataset pour les 9 features requises
BENIGN_PAYLOAD: dict[str, float] = {
    "Flow Duration": 73752313.0,
    "Total Fwd Packets": 5.0,
    "Total Backward Packets": 9.0,
    "Total Length of Fwd Packets": 11613.0,
    "Total Length of Bwd Packets": 62.0,
    "Bwd Packet Length Std": 5.3,
    "Flow Packets/s": 0.19,
    "Flow IAT Mean": 5673254.0,
    "ACK Flag Count": 1.0,
}

DDOS_PAYLOAD: dict[str, float] = {
    "Flow Duration": 248058.0,
    "Total Fwd Packets": 2.0,
    "Total Backward Packets": 5.0,
    "Total Length of Fwd Packets": 20.0,
    "Total Length of Bwd Packets": 11601.0,
    "Bwd Packet Length Std": 3022.5,
    "Flow Packets/s": 28.2,
    "Flow IAT Mean": 41343.0,
    "ACK Flag Count": 0.0,
}


def test_health_endpoint() -> None:
    """Vérifie le bon fonctionnement du endpoint de santé /api/health."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "version" in data
    assert data["model_name"] is not None


def test_model_info_endpoint() -> None:
    """Vérifie que /api/model-info renvoie la version et les métriques de features.json."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["version"] == "1.3.0"
    assert "date_entrainement" in data
    assert "features" in data
    assert len(data["features"]) == 9
    assert "Destination Port" not in data["features"]
    assert "Flow Duration" in data["features"]
    assert "datasets_entrainement" in data
    assert "dataset_test_externe" in data
    assert "metriques_test_externe" in data
    assert "metriques_test_externe_normal_2017_seul" in data
    assert "limitations" in data
    assert len(data["limitations"]) > 0


def test_predict_single_benign() -> None:
    """Vérifie la prédiction d'un flux normal avec les 9 features."""
    response = client.post("/api/predict", json=BENIGN_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "Normal"
    assert data["is_ddos"] is False
    assert 0.0 <= data["probability"] <= 0.5
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_ddos() -> None:
    """Vérifie la prédiction d'un flux DDoS avec les 9 features."""
    response = client.post("/api/predict", json=DDOS_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "DDoS"
    assert data["is_ddos"] is True
    assert 0.5 <= data["probability"] <= 1.0
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_validation_error() -> None:
    """Vérifie le rejet de données non conformes (ex: ACK Flag Count > 1)."""
    invalid_payload = BENIGN_PAYLOAD.copy()
    invalid_payload["ACK Flag Count"] = 5
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_csv_valid() -> None:
    """Vérifie l'analyse par lot d'un petit CSV valide avec les 9 colonnes."""
    csv_content = (
        "Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count\n"
        "73752313,5,9,11613,62,5.3,0.19,5673254.0,1\n"
        "248058,2,5,20,11601,3022.5,28.2,41343.0,0\n"
    )
    files = {"file": ("test_traffic.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 200
    data = response.json()

    assert "summary" in data
    summary = data["summary"]
    assert summary["total_rows"] == 2
    assert summary["error_rows"] == 0
    assert summary["normal_count"] == 1
    assert summary["ddos_count"] == 1
    assert summary["attack_percentage"] == 50.0

    assert len(data["rows"]) == 2
    assert data["rows"][0]["prediction"] == "Normal"
    assert data["rows"][1]["prediction"] == "DDoS"

    # Vérification des ajouts phase 2
    assert "nan_inf_rate" in summary
    assert summary["nan_inf_rate"] == 0.0

    assert "top_suspicious" in data
    assert len(data["top_suspicious"]) == 2
    # Doit être trié par score décroissant
    assert data["top_suspicious"][0]["probability"] >= data["top_suspicious"][1]["probability"]
    assert data["top_suspicious"][0]["row_index"] == 2
    assert "features" in data["top_suspicious"][0]

    assert "score_histogram" in data
    assert len(data["score_histogram"]) == 10
    total_hist_count = sum(b["count"] for b in data["score_histogram"])
    assert total_hist_count == 2


def test_feature_importance_endpoint() -> None:
    """Vérifie que /api/feature-importance retourne les 9 features triées par importance décroissante."""
    response = client.get("/api/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 9
    for item in data:
        assert "feature" in item
        assert "importance" in item
        assert isinstance(item["importance"], float)
    # Vérification du tri décroissant
    importances = [item["importance"] for item in data]
    assert importances == sorted(importances, reverse=True)


def test_predict_csv_nan_inf_rate() -> None:
    """Vérifie le calcul correct de nan_inf_rate et error_rows avec NaN et inf."""
    csv_avec_nan = (
        "Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count\n"
        "73752313,5,9,11613,62,5.3,0.19,5673254.0,1\n"
        "248058,NaN,5,20,11601,inf,28.2,41343.0,0\n"
    )
    files = {"file": ("nan_traffic.csv", io.BytesIO(csv_avec_nan.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 200
    summary = response.json()["summary"]
    assert summary["error_rows"] == 1
    # 2 valeurs anormales (NaN et inf) sur 18 cellules au total (2 lignes * 9 features) -> 2/18 = 0.1111
    assert 0.11 <= summary["nan_inf_rate"] <= 0.12


def test_predict_csv_missing_column_422() -> None:
    """Vérifie le rejet explicite avec 422 et la liste des colonnes manquantes."""
    csv_incomplet = (
        "Flow Duration,Total Fwd Packets,Total Backward Packets\n"
        "2500000,6,8\n"
    )
    files = {"file": ("missing_cols.csv", io.BytesIO(csv_incomplet.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert "Colonnes requises manquantes" in detail


def test_predict_csv_size_limit_413(monkeypatch) -> None:
    """Vérifie le renvoi du statut 413 si le fichier dépasse 50 Mo."""
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE", 100)
    gros_csv = "Flow Duration," * 50 + "\n" + "1," * 50 + "\n"
    files = {"file": ("large.csv", io.BytesIO(gros_csv.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 413
    assert "trop volumineux" in response.json()["detail"]


def test_service_unavailable_503_when_model_not_ready(monkeypatch) -> None:
    """Vérifie que les endpoints de prédiction répondent 503 si le modèle n'est pas chargé."""
    monkeypatch.setattr(main_module, "predictor_service", None)
    # Pour forcer get_predictor() à échouer au rechargement
    monkeypatch.setattr(settings, "MODEL_PATH", settings.ARTIFACTS_DIR / "non_existant.joblib")

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "degraded"
    assert health_res.json()["model_loaded"] is False

    pred_res = client.post("/api/predict", json=BENIGN_PAYLOAD)
    assert pred_res.status_code == 503
