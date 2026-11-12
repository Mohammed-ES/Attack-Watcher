"""
Suite de tests d'intégration et unitaires pour l'API FastAPI Attack Watcher.
"""

from __future__ import annotations

import io

from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

# Exemples de payload de test
BENIGN_PAYLOAD: dict[str, float] = {
    "Destination Port": 443,
    "Flow Duration": 2500000,
    "Total Fwd Packets": 6,
    "Total Backward Packets": 8,
    "Total Length of Fwd Packets": 800,
    "Total Length of Bwd Packets": 2400,
    "Bwd Packet Length Std": 120.5,
    "Flow Packets/s": 25.4,
    "Flow IAT Mean": 85000.0,
    "ACK Flag Count": 1,
}

DDOS_PAYLOAD: dict[str, float] = {
    "Destination Port": 80,
    "Flow Duration": 1200,
    "Total Fwd Packets": 25,
    "Total Backward Packets": 0,
    "Total Length of Fwd Packets": 2200,
    "Total Length of Bwd Packets": 0,
    "Bwd Packet Length Std": 0.0,
    "Flow Packets/s": 4200.0,
    "Flow IAT Mean": 12.0,
    "ACK Flag Count": 0,
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


def test_features_metadata_endpoint() -> None:
    """Vérifie la mise à disposition des métadonnées des features."""
    response = client.get("/api/features")
    assert response.status_code == 200
    data = response.json()
    assert len(data["features"]) == 10
    assert "Destination Port" in data["features"]
    assert "Flow Duration" in data["features"]
    assert "champion_model" in data
    assert "feature_descriptions" in data


def test_predict_single_benign() -> None:
    """Vérifie la prédiction d'un trafic réseau légitime (BENIGN)."""
    response = client.post("/api/predict", json=BENIGN_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "Normal"
    assert data["is_ddos"] is False
    assert 0.0 <= data["probability"] <= 0.5
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_ddos() -> None:
    """Vérifie la prédiction d'un trafic d'attaque DDoS."""
    response = client.post("/api/predict", json=DDOS_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "Attaque DDoS"
    assert data["is_ddos"] is True
    assert 0.5 <= data["probability"] <= 1.0
    assert 50.0 <= data["confidence"] <= 100.0


def test_predict_single_validation_error() -> None:
    """Vérifie le rejet de données non conformes (ex: port hors limites)."""
    invalid_payload = BENIGN_PAYLOAD.copy()
    invalid_payload["Destination Port"] = 70000  # Port supérieur à 65535
    response = client.post("/api/predict", json=invalid_payload)
    assert response.status_code == 422


def test_predict_csv_valid() -> None:
    """Vérifie l'analyse par lot d'un fichier CSV valide."""
    csv_content = (
        "Destination Port,Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count\n"
        "443,2500000,6,8,800,2400,120.5,25.4,85000.0,1\n"
        "80,1200,25,0,2200,0,0.0,4200.0,12.0,0\n"
    )
    files = {"file": ("test_traffic.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_analysed"] == 2
    assert len(data["rows"]) == 2
    assert data["rows"][0]["prediction"] == "Normal"
    assert data["rows"][1]["prediction"] == "Attaque DDoS"


def test_predict_csv_invalid_extension() -> None:
    """Vérifie le rejet des extensions non supportées."""
    files = {"file": ("test.txt", io.BytesIO(b"dummy text"), "text/plain")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 400


def test_predict_csv_missing_columns() -> None:
    """Vérifie le rejet d'un CSV sans les colonnes requises."""
    csv_incomplet = "Destination Port,Flow Duration\n80,1000\n"
    files = {"file": ("incomplete.csv", io.BytesIO(csv_incomplet.encode("utf-8")), "text/csv")}
    response = client.post("/api/predict-csv", files=files)
    assert response.status_code == 422


def test_download_annotated_csv() -> None:
    """Vérifie le téléchargement du fichier CSV enrichi des prédictions."""
    csv_content = (
        "Destination Port,Flow Duration,Total Fwd Packets,Total Backward Packets,"
        "Total Length of Fwd Packets,Total Length of Bwd Packets,Bwd Packet Length Std,"
        "Flow Packets/s,Flow IAT Mean,ACK Flag Count\n"
        "443,2500000,6,8,800,2400,120.5,25.4,85000.0,1\n"
    )
    files = {"file": ("export_test.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/download-annotated-csv", files=files)
    assert response.status_code == 200
    assert "attachment; filename=\"resultats_export_test.csv\"" in response.headers.get("content-disposition", "")
    content = response.text
    assert "Attack_Watcher_Prediction" in content
    assert "DDoS_Probability" in content
