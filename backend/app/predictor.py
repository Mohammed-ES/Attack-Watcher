"""
Service d'inférence Machine Learning pour Attack Watcher.
Charge les artefacts (modèle champion, scaler, métadonnées des features)
et gère les prédictions unitaires et par lot.
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
        scaler_path: Path = settings.SCALER_PATH,
        features_path: Path = settings.FEATURES_PATH,
    ) -> None:
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.features_path = features_path

        self.model: Any = None
        self.scaler: Any = None
        self.features_metadata: dict[str, Any] = {}
        self.feature_names: list[str] = []

        self.charger_artefacts()

    def charger_artefacts(self) -> None:
        """Charge le modèle, le scaler et les métadonnées depuis le disque."""
        if not self.model_path.exists():
            raise ModelLoadError(f"Fichier modèle introuvable : {self.model_path}")
        if not self.scaler_path.exists():
            raise ModelLoadError(f"Fichier scaler introuvable : {self.scaler_path}")
        if not self.features_path.exists():
            raise ModelLoadError(f"Fichier features introuvable : {self.features_path}")

        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            with open(self.features_path, "r", encoding="utf-8") as f:
                self.features_metadata = json.load(f)
            self.feature_names = self.features_metadata.get("features", [])
        except Exception as e:
            raise ModelLoadError(f"Erreur lors du chargement des artefacts ML : {e}") from e

    @property
    def est_pret(self) -> bool:
        """Vérifie si tous les composants sont opérationnels."""
        return self.model is not None and self.scaler is not None and len(self.feature_names) > 0

    @property
    def nom_modele(self) -> str:
        """Retourne le nom du modèle champion."""
        return self.features_metadata.get("champion_model", type(self.model).__name__)

    def predire_unitaire(self, features_dict: dict[str, float]) -> dict[str, Any]:
        """
        Effectue une prédiction sur un ensemble de 10 features réseau.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        # Vérification de l'exhaustivité des features
        manquantes = [f for f in self.feature_names if f not in features_dict]
        if manquantes:
            raise FeatureValidationError(f"Features manquantes pour l'inférence : {manquantes}")

        # Construction du DataFrame avec ordre strict des colonnes
        ligne_df = pd.DataFrame([{col: features_dict[col] for col in self.feature_names}])

        # Remplacement de valeurs aberrantes
        ligne_df = ligne_df.replace([np.inf, -np.inf], 0.0).fillna(0.0)

        # Normalisation
        scaled_features = self.scaler.transform(ligne_df)

        # Inférence
        prediction_val = int(self.model.predict(scaled_features)[0])
        probabilites = self.model.predict_proba(scaled_features)[0]

        # Classe 1 = DDoS, Classe 0 = BENIGN (Normal)
        proba_ddos = float(probabilites[1])
        is_ddos = prediction_val == 1
        label = "Attaque DDoS" if is_ddos else "Normal"
        confidence = proba_ddos * 100.0 if is_ddos else (1.0 - proba_ddos) * 100.0

        return {
            "prediction": label,
            "is_ddos": is_ddos,
            "probability": round(proba_ddos, 4),
            "confidence": round(confidence, 2),
            "model_name": self.nom_modele,
            "input_features": {k: float(features_dict[k]) for k in self.feature_names},
        }

    def predire_csv(self, contenu_bytes: bytes, nom_fichier: str) -> tuple[dict[str, Any], list[dict[str, Any]], str]:
        """
        Traite un fichier CSV téléversé, applique les prédictions par lot
        et génère un résumé statistique ainsi qu'un export CSV enrichi.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        try:
            df = pd.read_csv(io.BytesIO(contenu_bytes))
        except Exception as e:
            raise FeatureValidationError(f"Impossible de lire le fichier CSV : {e}") from e

        if df.empty:
            raise FeatureValidationError("Le fichier CSV fourni est vide.")

        # Nettoyage des espaces des noms de colonnes
        df.columns = df.columns.str.strip()

        # Vérification de la présence des features nécessaires
        manquantes = [col for col in self.feature_names if col not in df.columns]
        if manquantes:
            raise FeatureValidationError(
                f"Le fichier CSV ne contient pas toutes les colonnes requises. "
                f"Colonnes manquantes : {manquantes}"
            )

        # Extraction des features dans l'ordre requis
        X = df[self.feature_names].copy()

        # Nettoyage des inf / NaN sur les données d'entrée
        X = X.replace([np.inf, -np.inf], np.nan)
        X = X.fillna(0.0)

        # Normalisation par lot
        X_scaled = self.scaler.transform(X)

        # Prédictions vectorisées
        predictions = self.model.predict(X_scaled)
        probabilites = self.model.predict_proba(X_scaled)
        probas_ddos = probabilites[:, 1]

        total_analysed = len(df)
        total_attacks = int(np.sum(predictions == 1))
        total_normal = total_analysed - total_attacks
        attack_percentage = round((total_attacks / total_analysed) * 100.0, 2) if total_analysed > 0 else 0.0

        summary = {
            "total_analysed": total_analysed,
            "total_attacks": total_attacks,
            "total_normal": total_normal,
            "attack_percentage": attack_percentage,
        }

        # Construction des lignes de résultats
        rows_result: list[dict[str, Any]] = []
        for idx in range(total_analysed):
            is_ddos = bool(predictions[idx] == 1)
            proba = float(probas_ddos[idx])
            rows_result.append({
                "row_index": idx + 1,
                "prediction": "Attaque DDoS" if is_ddos else "Normal",
                "is_ddos": is_ddos,
                "probability": round(proba, 4),
                "features": {col: (float(df.iloc[idx][col]) if pd.notnull(df.iloc[idx][col]) else 0.0) for col in self.feature_names},
            })

        # Enrichissement du DataFrame original pour l'export téléchargeable
        df_export = df.copy()
        df_export["Attack_Watcher_Prediction"] = np.where(predictions == 1, "Attaque DDoS", "Normal")
        df_export["DDoS_Probability"] = np.round(probas_ddos, 4)

        csv_buffer = io.StringIO()
        df_export.to_csv(csv_buffer, index=False)
        csv_export_str = csv_buffer.getvalue()

        return summary, rows_result, csv_export_str


# Instance globale du service d'inférence
try:
    predictor = AttackPredictor()
except (ModelLoadError, FileNotFoundError, OSError):
    predictor = None
