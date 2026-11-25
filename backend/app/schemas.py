"""
Modèles de validation Pydantic v2 pour l'API Attack Watcher.
Définit les schémas stricts pour l'inférence unitaire, l'analyse par lot CSV et le point d'accès /api/model-info.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SinglePredictionRequest(BaseModel):
    """
    Saisie manuelle des 9 features réseau requises pour l'inférence (sans Destination Port).
    Supporte les alias avec espaces du format CIC-IDS2017 ainsi que snake_case.
    """
    model_config = ConfigDict(
        validate_by_name=True,
        validate_by_alias=True,
        populate_by_name=True,
    )

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
        """Convertit l'objet en dictionnaire ordonné avec les noms exacts de features.json."""
        return {
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
    prediction: str = Field(..., description="'Normal' ou 'DDoS'")
    is_ddos: bool = Field(..., description="True si classé en attaque DDoS")
    probability: float = Field(..., ge=0.0, le=1.0, description="Probabilité de la classe DDoS via predict_proba")
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
    total_rows: int
    error_rows: int
    normal_count: int
    ddos_count: int
    attack_percentage: float
    nan_inf_rate: float = 0.0

    # Alias pour compatibilité ascendante avec les composants React
    total_analysed: int
    total_attacks: int
    total_normal: int


class ScoreHistogramBin(BaseModel):
    """Tranche de distribution des scores de probabilité du modèle."""
    bin: str
    min_score: float
    max_score: float
    count: int


class FeatureImportanceItem(BaseModel):
    """Importance relative d'une variable au sein du RandomForest."""
    feature: str
    importance: float


class CsvPredictionResponse(BaseModel):
    """Réponse globale d'un téléversement de fichier CSV avec pagination et métriques avancées."""
    summary: CsvSummary
    rows: list[CsvRowPrediction]
    filename: str
    top_suspicious: list[CsvRowPrediction] = []
    score_histogram: list[ScoreHistogramBin] = []


class ModelInfoResponse(BaseModel):
    """Informations complètes lues depuis features.json."""
    version: str
    date_entrainement: str
    sklearn_version: str | None = None
    modele: str | None = None
    features: list[str]
    classes: dict[str, str] | None = None
    datasets_entrainement: list[str]
    dataset_test_externe: str
    metriques_test_externe: dict[str, Any]
    metriques_test_externe_normal_2017_seul: dict[str, Any]
    limitations: list[str]


class HealthResponse(BaseModel):
    """État de santé de l'API et disponibilité des artefacts ML."""
    status: str
    version: str
    model_loaded: bool
    model_name: str | None = None


class TpCheckItem(BaseModel):
    """Résultat d'un contrôle individuel de vérification de TP."""
    id: str
    label: str
    passed: bool
    status: str
    numeric: bool
    detail: str


class TpMetricPart(BaseModel):
    """Métriques extraites pour une partie du TP."""
    key: str
    label: str
    vp: int | None = None
    fp: int | None = None
    vn: int | None = None
    fn: int | None = None
    recall: float | None = None
    taux_fp: float | None = None
    accuracy: float | None = None
    precision: float | None = None
    f1: float | None = None


class TpVerifyResponse(BaseModel):
    """Rapport complet de vérification d'un rendu de TP étudiant."""
    etudiant: str | None = None
    sklearn_version: str | None = None
    score: int
    max_score: int
    percentage: float
    all_numeric_passed: bool
    total_csv_rows: int
    checks: list[TpCheckItem]
    metrics_by_part: list[TpMetricPart] = []
    recomputed_confusion_matrix: dict[str, int]
    empty_partie7_fields: list[str]
    limitations: list[str]


class TpTestFeaturesResponse(BaseModel):
    """Jeu de test étudiant sans étiquettes (id + 9 features uniquement)."""
    count: int
    features: list[str]
    rows: list[dict[str, Any]]


class TpPredictionItem(BaseModel):
    """Prédiction soumise par un étudiant pour une ligne identifiée par id."""
    id: int
    pred: int = Field(..., ge=0, le=1)


class TpSubmitRequest(BaseModel):
    """Requête de soumission des prédictions étudiantes."""
    predictions: list[TpPredictionItem] = Field(..., min_length=1)


class TpSubmitResponse(BaseModel):
    """Métriques renvoyées après soumission (sans matrice de confusion ni étiquettes)."""
    recall: float
    precision: float
    f1: float
    taux_fp: float
    total_predictions: int


class TpStatsResponse(BaseModel):
    """Statistiques d'activité TP anonymisées pour l'administration."""
    distinct_students: int
    total_imports: int
    total_errors: int
    total_submits: int
    last_24h: dict[str, int]
