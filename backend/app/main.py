"""
Application FastAPI principale pour Attack Watcher.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.predictor import (
    AttackPredictor,
    FeatureValidationError,
    ModelLoadError,
)
from backend.app.schemas import (
    CsvPredictionResponse,
    FeaturesMetadataResponse,
    HealthResponse,
    SinglePredictionRequest,
    SinglePredictionResponse,
)

# Gestion du cycle de vie de l'application (Lifespan moderne FastAPI)
predictor_service: AttackPredictor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialise le moteur d'inférence lors du démarrage de l'API."""
    global predictor_service
    try:
        predictor_service = AttackPredictor()
    except (ModelLoadError, FileNotFoundError, OSError) as exc:
        predictor_service = None
        print(f"[Avertissement] Impossible de charger les artefacts ML au démarrage : {exc}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API de détection d'attaques DDoS en temps réel par Machine Learning.",
    lifespan=lifespan,
)

# Configuration CORS pour autoriser le frontend Vite / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_predictor() -> AttackPredictor:
    """Fournisseur d'accès au service d'inférence avec vérification d'état."""
    global predictor_service
    if predictor_service is None or not predictor_service.est_pret:
        try:
            predictor_service = AttackPredictor()
        except (ModelLoadError, FileNotFoundError, OSError) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Les artefacts du modèle ML ne sont pas disponibles : {exc}",
            ) from exc
    return predictor_service


@app.get(f"{settings.API_PREFIX}/health", response_model=HealthResponse, tags=["Système"])
async def health_check() -> HealthResponse:
    """Vérifie l'état opérationnel de l'API et des modèles ML."""
    is_ready = False
    model_name = None
    try:
        pred = get_predictor()
        is_ready = pred.est_pret
        model_name = pred.nom_modele
    except HTTPException:
        is_ready = False

    return HealthResponse(
        status="healthy" if is_ready else "degraded",
        version=settings.PROJECT_VERSION,
        model_loaded=is_ready,
        champion_model=model_name,
    )


@app.get(f"{settings.API_PREFIX}/features", response_model=FeaturesMetadataResponse, tags=["Modèle ML"])
async def get_features_metadata() -> FeaturesMetadataResponse:
    """Renvoie la liste des features requises, leurs descriptions et les métriques du benchmark."""
    pred = get_predictor()
    meta = pred.features_metadata
    return FeaturesMetadataResponse(
        features=pred.feature_names,
        feature_descriptions=meta.get("feature_descriptions", {}),
        target=meta.get("target", "Label"),
        label_mapping=meta.get("label_mapping", {"0": "Normal", "1": "Attaque DDoS"}),
        champion_model=pred.nom_modele,
        benchmark=meta.get("benchmark"),
    )


@app.post(f"{settings.API_PREFIX}/predict", response_model=SinglePredictionResponse, tags=["Inférence"])
async def predict_single(payload: SinglePredictionRequest) -> SinglePredictionResponse:
    """
    Prédiction unitaire à partir de la saisie manuelle de 10 features réseau.
    Retourne 'Normal' ou 'Attaque DDoS' ainsi que la probabilité associée.
    """
    pred = get_predictor()
    try:
        resultat = pred.predire_unitaire(payload.to_features_dict())
        return SinglePredictionResponse(**resultat)
    except FeatureValidationError as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(err)) from err
    except (RuntimeError, ValueError) as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur d'inférence : {err}") from err


@app.post(f"{settings.API_PREFIX}/predict-csv", response_model=CsvPredictionResponse, tags=["Inférence"])
async def predict_csv(
    file: Annotated[UploadFile, File(description="Fichier CSV de flux réseau")]
) -> CsvPredictionResponse:
    """
    Analyse un fichier CSV de trafic réseau par lot.
    Renvoie le résumé statistique (total, attaques, pourcentage) et les lignes analysées.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format de fichier invalide. Seuls les fichiers .csv sont acceptés.",
        )

    contenu = await file.read()
    pred = get_predictor()

    try:
        summary, rows, _ = pred.predire_csv(contenu, nom_fichier=file.filename)
        return CsvPredictionResponse(
            summary=summary,
            rows=rows,
            filename=file.filename,
        )
    except FeatureValidationError as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(err)) from err
    except (RuntimeError, ValueError) as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement du fichier CSV : {err}",
        ) from err


@app.post(f"{settings.API_PREFIX}/download-annotated-csv", tags=["Inférence"])
async def download_annotated_csv(
    file: Annotated[UploadFile, File(description="Fichier CSV de flux réseau")]
) -> Response:
    """
    Traite le CSV et retourne directement le fichier enrichi avec les colonnes
    Attack_Watcher_Prediction et DDoS_Probability en téléchargement.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seuls les fichiers .csv sont acceptés pour le téléchargement enrichi.",
        )

    contenu = await file.read()
    pred = get_predictor()

    try:
        _, _, csv_str = pred.predire_csv(contenu, nom_fichier=file.filename)
        nom_sortie = f"resultats_{file.filename}"
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{nom_sortie}"'},
        )
    except FeatureValidationError as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(err)) from err
    except (RuntimeError, ValueError) as err:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(err)) from err
