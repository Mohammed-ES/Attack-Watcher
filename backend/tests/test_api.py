"""
Suite de tests d'intégration et unitaires pour l'API FastAPI Attack Watcher.
Couvre l'inférence unitaire, par lot, la validation des 9 features, la limite 50 Mo et /api/model-info.
"""

from __future__ import annotations

import io

from fastapi.testclient import TestClient

from backend.app.config import settings
from backend.app.main import app

client = TestClient(app)

# Exemples de flux réels issus du dataset CIC-IDS2017 avec les 9 features requises
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
    assert data["champion_model"] is not None


def test_model_info_endpoint() -> None:
    """Vérifie que /api/model-info renvoie la version, les datasets et les métriques réelles."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert "datasets" in data
    assert isinstance(data["datasets"], list)
    assert len(data["datasets"]) > 0
    assert "training_date" in data
    assert "features" in data
    assert len(data["features"]) == 9
    assert "Destination Port" not in data["features"]
    assert "Flow Duration" in data["features"]
    assert "metrics" in data
    assert "f1_score" in data["metrics"]
    assert "precision" in data["metrics"]
    assert "recall" in data["metrics"]
    assert "confusion_matrix" in data["metrics"]


def test_features_metadata_endpoint() -> None:
    """Vérifie la mise à disposition des métadonnées des 9 features."""
    response = client.get("/api/features")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 9
    assert "Destination Port" not in data["features"]
    assert "Flow Duration" in data["features"]
    assert "champion_model" in data
    assert "feature_descriptions" in data


def test_predict_single_benign() -> None:
    """Vérifie la prédiction d'un flux normal."""
    response = client.post("/api/predict", json=BENIGN_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "Normal"
    assert data["is_ddos"] is False
    assert data["probability"] is not None
    assert 0.0 <= data["probability"] <= 0.5
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_ddos() -> None:
    """Vérifie la prédiction d'un flux DDoS."""
    response = client.post("/api/predict", json=DDOS_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "Attaque DDoS"
    assert data["is_ddos"] is True
    assert data["probability"] is not None
    assert 0.5 <= data["probability"] <= 1.0
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_validation_error() -> None:
    """Vérifie le rejet de données non conformes (ex: ACK Flag Count > 1)."""
    invalid_payload = BENIGN_PAYLOAD.copy()
    invalid_payload["ACK Flag Count"] = 5  # Valeur interdite (> 1)
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_csv_valid() -> None:
    """Vérifie l'analyse par lot d'un fichier CSV valide avec les 9 colonnes."""
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
    assert data["rows"][1]["prediction"] == "Attaque DDoS"


def test_predict_csv_missing_column() -> None:
    """Vérifie le rejet explicite (400) si une feature obligatoire est absente du CSV."""
    csv_incomplet = (
        "Flow Duration,Total Fwd Packets,Total Backward Packets\n"
        "2500000,6,8\n"
    )
    files = {"file": ("missing_cols.csv", io.BytesIO(csv_incomplet.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert "Colonnes requises manquantes" in detail


def test_predict_csv_size_limit_413(monkeypatch) -> None:
    """Vérifie le renvoi du statut 413 si le fichier dépasse la limite configurée (50 Mo)."""
    # Pour le test unitaire, on abaisse temporairement la limite à 100 octets
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE", 100)
    gros_csv = "Flow Duration," * 50 + "\n" + "1," * 50 + "\n"
    files = {"file": ("large.csv", io.BytesIO(gros_csv.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 413
    assert "trop volumineux" in response.json()["detail"]
