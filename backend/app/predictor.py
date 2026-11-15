"""
Service d'inférence Machine Learning pour Attack Watcher.
Charge les artefacts unifiés (pipeline étanche avec imputer + scaler + classifieur, métadonnées réelles)
et gère les prédictions unitaires et par lot sans aucune simulation de données.
"""

from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from backend.app.config import settings


class ModelLoadError(RuntimeError):
    """Exception levée lorsque les artefacts ML ne peuvent pas être chargés."""


class FeatureValidationError(ValueError):
    """Exception levée en cas de features manquantes ou non conformes."""


class AttackPredictor:
    """Moteur d'inférence DDoS."""

    def __init__(
        self,
        model_path: Path = settings.MODEL_PATH,
        features_path: Path = settings.FEATURES_PATH,
    ) -> None:
        self.model_path = model_path
        self.features_path = features_path

        self.pipeline: Any = None
        self.feature_names: list[str] = []
        self.feature_descriptions: dict[str, str] = {}
        self.version: str = "1.1.0"
        self.datasets: list[str] = []
        self.training_date: str = ""
        self.metrics: dict[str, Any] = {}
        self.benchmark: dict[str, Any] = {}
        self.nom_modele: str = "RandomForest"
        self.validation_strategy: str = ""

        self.charger_artefacts()

    def charger_artefacts(self) -> None:
        """Charge le bundle d'artefacts ML depuis le disque."""
        if not self.model_path.exists():
            raise ModelLoadError(f"Fichier modèle introuvable : {self.model_path}")

        try:
            bundle = joblib.load(self.model_path)
            if isinstance(bundle, dict) and "model" in bundle:
                self.pipeline = bundle["model"]
                self.feature_names = bundle.get("features", [])
                self.feature_descriptions = bundle.get("feature_descriptions", {})
                self.version = bundle.get("version", "1.1.0")
                self.datasets = bundle.get("datasets", [])
                self.training_date = bundle.get("training_date", "")
                self.metrics = bundle.get("metrics", {})
                self.benchmark = bundle.get("benchmark", {})
                self.nom_modele = bundle.get("champion_model", type(self.pipeline).__name__)
                self.validation_strategy = bundle.get("validation_strategy", "")
            else:
                # Modèle brut
                self.pipeline = bundle
                if self.features_path.exists():
                    with open(self.features_path, "r", encoding="utf-8") as f:
                        meta = json.load(f)
                    self.feature_names = meta.get("features", [])
                    self.feature_descriptions = meta.get("feature_descriptions", {})
                    self.version = meta.get("version", "1.1.0")
                    self.datasets = meta.get("datasets", [])
                    self.training_date = meta.get("training_date", "")
                    self.metrics = meta.get("metrics", {})
                    self.benchmark = meta.get("benchmark", {})
                    self.nom_modele = meta.get("champion_model", type(self.pipeline).__name__)
                    self.validation_strategy = meta.get("validation_strategy", "")

        except Exception as e:
            raise ModelLoadError(f"Erreur lors du chargement des artefacts ML : {e}") from e

    @property
    def est_pret(self) -> bool:
        """Vérifie si tous les composants sont opérationnels."""
        return self.pipeline is not None and len(self.feature_names) > 0

    @property
    def features_metadata(self) -> dict[str, Any]:
        """Retourne les métadonnées descriptives pour l'API."""
        return {
            "features": self.feature_names,
            "feature_descriptions": self.feature_descriptions,
            "target": "Label",
            "label_mapping": {
                "0": "Normal",
                "1": "Attaque DDoS",
            },
            "champion_model": self.nom_modele,
            "benchmark": self.benchmark,
        }

    def predire_unitaire(self, features_dict: dict[str, float]) -> dict[str, Any]:
        """
        Effectue une prédiction unitaire sur les 9 features réseau requises.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        # Vérification stricte de la complétude des colonnes
        manquantes = [f for f in self.feature_names if f not in features_dict]
        if manquantes:
            raise FeatureValidationError(f"Features manquantes pour l'inférence : {manquantes}")

        # DataFrame aligné avec l'ordre strict des features
        ligne_df = pd.DataFrame([{col: features_dict[col] for col in self.feature_names}])
        ligne_df = ligne_df.replace([np.inf, -np.inf], np.nan)

        # Inférence via la pipeline (SimpleImputer + StandardScaler + Classifieur)
        prediction_val = int(self.pipeline.predict(ligne_df)[0])

        proba_ddos: float | None = None
        confidence: float = 100.0

        if hasattr(self.pipeline, "predict_proba"):
            probabilites = self.pipeline.predict_proba(ligne_df)[0]
            proba_ddos = float(probabilites[1])
            is_ddos = prediction_val == 1
            confidence = proba_ddos * 100.0 if is_ddos else (1.0 - proba_ddos) * 100.0
        else:
            is_ddos = prediction_val == 1

        label = "Attaque DDoS" if is_ddos else "Normal"

        return {
            "prediction": label,
            "is_ddos": is_ddos,
            "probability": round(proba_ddos, 4) if proba_ddos is not None else None,
            "confidence": round(confidence, 2),
            "model_name": self.nom_modele,
            "input_features": {k: float(features_dict[k]) for k in self.feature_names},
        }

    def predire_csv(self, contenu_bytes: bytes, nom_fichier: str) -> tuple[dict[str, Any], list[dict[str, Any]], str]:
        """
        Traite un fichier CSV de trafic réseau, valide les colonnes,
        applique les prédictions réelles par lot et génère les statistiques ainsi qu'un export enrichi.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        try:
            df = pd.read_csv(io.BytesIO(contenu_bytes), low_memory=False)
        except Exception as e:
            raise FeatureValidationError(f"Impossible de lire le fichier CSV : {e}") from e

        if df.empty:
            raise FeatureValidationError("Le fichier CSV fourni est vide.")

        # Nettoyage des espaces blancs dans les noms de colonnes
        df.columns = df.columns.str.strip()

        # Validation stricte des colonnes requises
        manquantes = [col for col in self.feature_names if col not in df.columns]
        if manquantes:
            raise FeatureValidationError(
                f"Colonnes requises manquantes dans le fichier CSV : {manquantes}. "
                f"Colonnes attendues : {self.feature_names}"
            )

        total_rows = len(df)
        X = df[self.feature_names].copy()

        # Conversion numérique et détection des lignes en erreur
        lignes_en_erreur = 0
        for col in self.feature_names:
            col_numerique = pd.to_numeric(X[col], errors="coerce")
            lignes_en_erreur += int(col_numerique.isna().sum())
            X[col] = col_numerique

        # Remplacement des inf / -inf par NaN pour prise en charge automatique par le SimpleImputer
        X = X.replace([np.inf, -np.inf], np.nan)

        # Prédictions vectorisées
        predictions = self.pipeline.predict(X)

        has_proba = hasattr(self.pipeline, "predict_proba")
        if has_proba:
            probabilites = self.pipeline.predict_proba(X)
            probas_ddos = probabilites[:, 1]
        else:
            probas_ddos = None

        ddos_count = int(np.sum(predictions == 1))
        normal_count = total_rows - ddos_count
        attack_percentage = round((ddos_count / total_rows) * 100.0, 2) if total_rows > 0 else 0.0

        summary = {
            "total_rows": total_rows,
            "error_rows": lignes_en_erreur,
            "normal_count": normal_count,
            "ddos_count": ddos_count,
            "attack_percentage": attack_percentage,
            # Rétrocompatibilité
            "total_analysed": total_rows,
            "total_attacks": ddos_count,
            "total_normal": normal_count,
        }

        # Construction des enregistrements pour l'affichage
        rows_result: list[dict[str, Any]] = []
        for idx in range(total_rows):
            is_ddos = bool(predictions[idx] == 1)
            proba = float(probas_ddos[idx]) if probas_ddos is not None else None
            rows_result.append({
                "row_index": idx + 1,
                "prediction": "Attaque DDoS" if is_ddos else "Normal",
                "is_ddos": is_ddos,
                "probability": round(proba, 4) if proba is not None else None,
                "features": {col: (float(df.iloc[idx][col]) if pd.notnull(df.iloc[idx][col]) else 0.0) for col in self.feature_names},
            })

        # Enrichissement du DataFrame original pour l'export
        df_export = df.copy()
        df_export["Attack_Watcher_Prediction"] = np.where(predictions == 1, "Attaque DDoS", "Normal")
        if probas_ddos is not None:
            df_export["DDoS_Probability"] = np.round(probas_ddos, 4)

        csv_buffer = io.StringIO()
        df_export.to_csv(csv_buffer, index=False)
        csv_export_str = csv_buffer.getvalue()

        return summary, rows_result, csv_export_str


try:
    predictor = AttackPredictor()
except (ModelLoadError, FileNotFoundError, OSError):
    predictor = None
