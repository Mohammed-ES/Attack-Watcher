"""
Service d'inférence Machine Learning pour Attack Watcher.
Charge la pipeline scikit-learn (SimpleImputer + RandomForestClassifier) et features.json
depuis des chemins absolus sans aucune donnée simulée ni StandardScaler.
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
    """Exception levée en cas de features obligatoires manquantes dans les données fournies."""


class AttackPredictor:
    """Moteur d'inférence DDoS basé sur la pipeline scikit-learn."""

    def __init__(
        self,
        model_path: Path = settings.MODEL_PATH,
        features_path: Path = settings.FEATURES_PATH,
    ) -> None:
        self.model_path = model_path
        self.features_path = features_path

        self.pipeline: Any = None
        self.model_info: dict[str, Any] = {}
        self.feature_names: list[str] = []
        self.classes_map: dict[str, str] = {"0": "Normal", "1": "DDoS"}
        self.nom_modele: str = "RandomForestClassifier (Pipeline avec SimpleImputer)"

        self.charger_artefacts()

    def charger_artefacts(self) -> None:
        """Charge model.joblib (pipeline scikit-learn) et features.json."""
        if not self.model_path.exists():
            raise ModelLoadError(f"Fichier modèle introuvable : {self.model_path}")
        if not self.features_path.exists():
            raise ModelLoadError(f"Fichier features.json introuvable : {self.features_path}")

        try:
            # 1. Lecture des métadonnées officielles depuis features.json
            with open(self.features_path, "r", encoding="utf-8") as f:
                self.model_info = json.load(f)

            self.feature_names = self.model_info.get("features", [])
            self.classes_map = self.model_info.get("classes", {"0": "Normal", "1": "DDoS"})
            self.nom_modele = self.model_info.get(
                "modele", "RandomForestClassifier (Pipeline avec SimpleImputer)"
            )

            # 2. Chargement de la pipeline scikit-learn (SimpleImputer + RandomForestClassifier)
            self.pipeline = joblib.load(self.model_path)

        except Exception as e:
            raise ModelLoadError(f"Erreur lors du chargement des artefacts ML : {e}") from e

    @property
    def est_pret(self) -> bool:
        """Vérifie si la pipeline et les métadonnées sont opérationnelles."""
        return self.pipeline is not None and len(self.feature_names) == 9

    def predire_unitaire(self, features_dict: dict[str, float]) -> dict[str, Any]:
        """
        Effectue une prédiction unitaire sur les 9 features réseau requises.
        Retourne le verdict ('Normal' ou 'DDoS') et la probabilité via predict_proba.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        # Vérification stricte des 9 colonnes
        manquantes = [f for f in self.feature_names if f not in features_dict]
        if manquantes:
            raise FeatureValidationError(
                f"Features manquantes pour l'inférence : {manquantes}. Attendues : {self.feature_names}"
            )

        # Construction du DataFrame avec ordre strict des 9 features
        df_ligne = pd.DataFrame([{col: features_dict[col] for col in self.feature_names}])
        df_ligne = df_ligne.apply(pd.to_numeric, errors="coerce")
        df_ligne = df_ligne.replace([np.inf, -np.inf], np.nan)

        # Inférence via la pipeline (SimpleImputer + RandomForestClassifier)
        prediction_val = int(self.pipeline.predict(df_ligne)[0])
        probabilites = self.pipeline.predict_proba(df_ligne)[0]
        proba_ddos = float(probabilites[1])

        is_ddos = prediction_val == 1
        label = "DDoS" if is_ddos else "Normal"
        confidence = proba_ddos * 100.0 if is_ddos else (1.0 - proba_ddos) * 100.0

        return {
            "prediction": label,
            "is_ddos": is_ddos,
            "probability": round(proba_ddos, 4),
            "confidence": round(confidence, 2),
            "model_name": self.nom_modele,
            "input_features": {k: float(features_dict[k]) for k in self.feature_names},
        }

    def predire_csv(
        self, contenu_bytes: bytes, nom_fichier: str
    ) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], str]:
        """
        Traite un fichier CSV :
        - Strip des noms de colonnes
        - Refuse avec 422 si l'une des 9 features manque
        - Ignore les colonnes en trop
        - pd.to_numeric(errors='coerce') et remplacement de +inf/-inf par NaN
        - Calcul de nan_inf_rate avant imputation
        - L'imputation est assurée par la pipeline
        - Retourne summary, rows, top_suspicious, score_histogram et le CSV enrichi
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        try:
            df = pd.read_csv(io.BytesIO(contenu_bytes), low_memory=False)
        except Exception as e:
            raise FeatureValidationError(f"Impossible de lire le fichier CSV : {e}") from e

        if df.empty:
            raise FeatureValidationError("Le fichier CSV fourni est vide.")

        # 1. Strip des noms de colonnes
        df.columns = df.columns.str.strip()

        # 2. Vérification stricte des 9 features (les colonnes en trop sont ignorées)
        manquantes = [col for col in self.feature_names if col not in df.columns]
        if manquantes:
            raise FeatureValidationError(
                f"Colonnes requises manquantes dans le fichier CSV : {manquantes}. "
                f"Colonnes attendues : {self.feature_names}"
            )

        total_rows = len(df)
        total_cells = total_rows * len(self.feature_names)
        X = df[self.feature_names].copy()

        # 3. Conversion numérique, détection nan/inf et calcul de nan_inf_rate avant imputation
        nan_or_inf_count = 0
        row_has_bad = pd.Series(False, index=X.index)

        for col in self.feature_names:
            s_num = pd.to_numeric(X[col], errors="coerce")
            is_bad = s_num.isna() | np.isinf(s_num)
            nan_or_inf_count += int(is_bad.sum())
            row_has_bad = row_has_bad | is_bad
            X[col] = s_num

        lignes_en_erreur = int(row_has_bad.sum())
        nan_inf_rate = (
            round(float(nan_or_inf_count / total_cells), 4) if total_cells > 0 else 0.0
        )

        # 4. Remplacement de +inf et -inf par NaN (l'imputation médiane est assurée par la pipeline)
        X = X.replace([np.inf, -np.inf], np.nan)

        # 5. Inférence et probabilités vectorisées
        predictions = self.pipeline.predict(X)
        probabilites = self.pipeline.predict_proba(X)
        probas_ddos = probabilites[:, 1]

        ddos_count = int(np.sum(predictions == 1))
        normal_count = total_rows - ddos_count
        attack_percentage = (
            round((ddos_count / total_rows) * 100.0, 2) if total_rows > 0 else 0.0
        )

        summary = {
            "total_rows": total_rows,
            "error_rows": lignes_en_erreur,
            "normal_count": normal_count,
            "ddos_count": ddos_count,
            "attack_percentage": attack_percentage,
            "nan_inf_rate": nan_inf_rate,
            # Rétrocompatibilité
            "total_analysed": total_rows,
            "total_attacks": ddos_count,
            "total_normal": normal_count,
        }

        # 6. Construction des lignes de résultats
        rows_result: list[dict[str, Any]] = []
        for idx in range(total_rows):
            is_ddos = bool(predictions[idx] == 1)
            proba = float(probas_ddos[idx])
            rows_result.append({
                "row_index": idx + 1,
                "prediction": "DDoS" if is_ddos else "Normal",
                "is_ddos": is_ddos,
                "probability": round(proba, 4),
                "features": {
                    col: (
                        float(df.iloc[idx][col])
                        if pd.notnull(df.iloc[idx][col])
                        else 0.0
                    )
                    for col in self.feature_names
                },
            })

        # 7. Top 20 flux à plus fort score (triés par probabilité décroissante)
        top_suspicious = sorted(
            rows_result, key=lambda r: r["probability"], reverse=True
        )[:20]

        # 8. Histogramme des scores (10 tranches de 10%)
        histogram_bins = [
            {"bin": "0-10%", "min_score": 0.0, "max_score": 0.1, "count": 0},
            {"bin": "10-20%", "min_score": 0.1, "max_score": 0.2, "count": 0},
            {"bin": "20-30%", "min_score": 0.2, "max_score": 0.3, "count": 0},
            {"bin": "30-40%", "min_score": 0.3, "max_score": 0.4, "count": 0},
            {"bin": "40-50%", "min_score": 0.4, "max_score": 0.5, "count": 0},
            {"bin": "50-60%", "min_score": 0.5, "max_score": 0.6, "count": 0},
            {"bin": "60-70%", "min_score": 0.6, "max_score": 0.7, "count": 0},
            {"bin": "70-80%", "min_score": 0.7, "max_score": 0.8, "count": 0},
            {"bin": "80-90%", "min_score": 0.8, "max_score": 0.9, "count": 0},
            {"bin": "90-100%", "min_score": 0.9, "max_score": 1.0, "count": 0},
        ]
        for proba_val in probas_ddos:
            bin_idx = max(min(int(proba_val * 10), 9), 0)
            histogram_bins[bin_idx]["count"] += 1

        # 9. Export CSV enrichi avec Attack_Watcher_Prediction et DDoS_Probability
        df_export = df.copy()
        df_export["Attack_Watcher_Prediction"] = np.where(predictions == 1, "DDoS", "Normal")
        df_export["DDoS_Probability"] = np.round(probas_ddos, 4)

        csv_buffer = io.StringIO()
        df_export.to_csv(csv_buffer, index=False)
        csv_export_str = csv_buffer.getvalue()

        return summary, rows_result, top_suspicious, histogram_bins, csv_export_str

    def obtenir_importances(self) -> list[dict[str, Any]]:
        """
        Retourne les 9 features et leurs importances (feature_importances_)
        extraites du classifieur RandomForest, triées par ordre décroissant.
        """
        if not self.est_pret:
            raise ModelLoadError("Le moteur d'inférence n'est pas initialisé.")

        clf = getattr(self.pipeline, "named_steps", {}).get("classifier")
        if clf is None or not hasattr(clf, "feature_importances_"):
            raise RuntimeError("Le modèle ne dispose pas de l'attribut feature_importances_.")

        importances = clf.feature_importances_
        items = [
            {"feature": f, "importance": round(float(imp), 6)}
            for f, imp in zip(self.feature_names, importances)
        ]
        items.sort(key=lambda x: x["importance"], reverse=True)
        return items


try:
    predictor = AttackPredictor()
except (ModelLoadError, FileNotFoundError, OSError):
    predictor = None
