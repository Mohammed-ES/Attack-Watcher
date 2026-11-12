"""
Modèles de validation Pydantic v2 pour l'API Attack Watcher.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SinglePredictionRequest(BaseModel):
    """
    Saisie manuelle des 10 features réseau requises pour l'inférence.
    Supporte à la fois les clés snake_case et les noms de colonnes officiels CIC-IDS2017.
    """
    model_config = ConfigDict(
        validate_by_name=True,
        validate_by_alias=True,
        populate_by_name=True,
    )

    destination_port: float = Field(..., alias="Destination Port", ge=0, le=65535, description="Port cible (ex: 80, 443)")
    flow_duration: float = Field(..., alias="Flow Duration", ge=0, description="Durée totale en microsecondes")
    total_fwd_packets: float = Field(..., alias="Total Fwd Packets", ge=0, description="Nombre total de paquets aller")
    total_backward_packets: float = Field(..., alias="Total Backward Packets", ge=0, description="Nombre total de paquets retour")
    total_length_of_fwd_packets: float = Field(..., alias="Total Length of Fwd Packets", ge=0, description="Octets totaux aller")
    total_length_of_bwd_packets: float = Field(..., alias="Total Length of Bwd Packets", ge=0, description="Octets totaux retour")
    bwd_packet_length_std: float = Field(..., alias="Bwd Packet Length Std", ge=0, description="Écart-type taille paquets retour")
    flow_packets_s: float = Field(..., alias="Flow Packets/s", ge=0, description="Taux de paquets par seconde")
    flow_iat_mean: float = Field(..., alias="Flow IAT Mean", ge=0, description="Temps moyen inter-paquets")
    ack_flag_count: float = Field(..., alias="ACK Flag Count", ge=0, le=1, description="Drapeau ACK (0 ou 1)")

    def to_features_dict(self) -> dict[str, float]:
        """Convertit l'objet en dictionnaire avec les noms de colonnes exacts pour le modèle."""
        return {
            "Destination Port": float(self.destination_port),
            "Flow Duration": float(self.flow_duration),
            "Total Fwd Packets": float(self.total_fwd_packets),
            "Total Backward Packets": float(self.total_backward_packets),
            "Total Length of Fwd Packets": float(self.total_length_of_fwd_packets),
            "Total Length of Bwd Packets": float(self.total_length_of_bwd_packets),
            "Bwd Packet Length Std": float(self.bwd_packet_length_std),
            "Flow Packets/s": float(self.flow_packets_s),
            "Flow IAT Mean": float(self.flow_iat_mean),
            "ACK Flag Count": float(self.ack_flag_count),
        }


class SinglePredictionResponse(BaseModel):
    """Réponse d'une prédiction unitaire."""
    prediction: str = Field(..., description="'Normal' ou 'Attaque DDoS'")
    is_ddos: bool = Field(..., description="True si classé en attaque DDoS")
    probability: float = Field(..., ge=0.0, le=1.0, description="Probabilité de la classe DDoS")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Niveau de certitude en pourcentage")
    model_name: str = Field(..., description="Nom de l'algorithme ayant produit le résultat")
    input_features: dict[str, float]


class CsvRowPrediction(BaseModel):
    """Résultat pour une ligne d'un fichier CSV analysé."""
    row_index: int
    prediction: str
    is_ddos: bool
    probability: float
    features: dict[str, Any]


class CsvSummary(BaseModel):
    """Statistiques globales après traitement d'un fichier CSV."""
    total_analysed: int
    total_attacks: int
    total_normal: int
    attack_percentage: float


class CsvPredictionResponse(BaseModel):
    """Réponse globale d'un téléversement de fichier CSV."""
    summary: CsvSummary
    rows: list[CsvRowPrediction]
    filename: str


class FeaturesMetadataResponse(BaseModel):
    """Métadonnées des features et statistiques du modèle pour l'interface utilisateur."""
    features: list[str]
    feature_descriptions: dict[str, str]
    target: str
    label_mapping: dict[str, str]
    champion_model: str
    benchmark: dict[str, Any] | None = None


class HealthResponse(BaseModel):
    """État de santé de l'API et disponibilité des artefacts ML."""
    status: str
    version: str
    model_loaded: bool
    champion_model: str | None = None
