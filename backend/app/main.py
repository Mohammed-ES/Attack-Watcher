"""
Application FastAPI principale pour Attack Watcher.
API REST pour la détection DDoS basée sur un modèle Random Forest et SimpleImputer.
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
    FeatureImportanceItem,
    HealthResponse,
    ModelInfoResponse,
    SinglePredictionRequest,
    SinglePredictionResponse,
)

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
    description="API de détection d'attaques DDoS par Machine Learning.",
    lifespan=lifespan,
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_predictor() -> AttackPredictor:
    """Fournisseur d'accès au service d'inférence avec vérification d'état (503 si indisponible)."""
    global predictor_service
    if predictor_service is None or not predictor_service.est_pret:
        try:
            predictor_service = AttackPredictor(
                model_path=settings.MODEL_PATH,
                features_path=settings.FEATURES_PATH,
            )
        except (ModelLoadError, FileNotFoundError, OSError) as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Le modèle ML n'est pas chargé ou indisponible : {exc}",
            ) from exc

    if not predictor_service.est_pret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le service d'inférence ML n'est pas prêt.",
        )

    return predictor_service


@app.get(f"{settings.API_PREFIX}/health", response_model=HealthResponse, tags=["Système"])
async def health_check() -> HealthResponse:
    """Vérifie l'état opérationnel de l'API et du modèle ML (signale status='degraded' si non chargé)."""
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
        model_name=model_name,
    )


@app.get(f"{settings.API_PREFIX}/model-info", response_model=ModelInfoResponse, tags=["Modèle ML"])
async def get_model_info() -> ModelInfoResponse:
    """
    Lit features.json et renvoie la version, date_entrainement, features,
    datasets_entrainement, dataset_test_externe, metriques_test_externe,
    metriques_test_externe_normal_2017_seul et limitations.
    """
    pred = get_predictor()
    info = pred.model_info
    return ModelInfoResponse(
        version=info.get("version", "1.3.0"),
        date_entrainement=info.get("date_entrainement", ""),
        sklearn_version=info.get("sklearn_version"),
        modele=info.get("modele"),
        features=pred.feature_names,
        classes=info.get("classes"),
        datasets_entrainement=info.get("datasets_entrainement", []),
        dataset_test_externe=info.get("dataset_test_externe", ""),
        metriques_test_externe=info.get("metriques_test_externe", {}),
        metriques_test_externe_normal_2017_seul=info.get(
            "metriques_test_externe_normal_2017_seul", {}
        ),
        limitations=info.get("limitations", []),
    )


@app.get(
    f"{settings.API_PREFIX}/feature-importance",
    response_model=list[FeatureImportanceItem],
    tags=["Modèle ML"],
)
async def get_feature_importance() -> list[FeatureImportanceItem]:
    """
    Retourne les 9 features et leurs importances (feature_importances_)
    extraites du classifieur RandomForest, triées par ordre décroissant.
    """
    pred = get_predictor()
    try:
        items = pred.obtenir_importances()
        return [FeatureImportanceItem(**item) for item in items]
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Impossible d'extraire l'importance des variables : {err}",
        ) from err


@app.post(f"{settings.API_PREFIX}/predict", response_model=SinglePredictionResponse, tags=["Inférence"])
async def predict_single(payload: SinglePredictionRequest) -> SinglePredictionResponse:
    """
    Prédiction unitaire sur les 9 features réseau requises.
    Retourne 'Normal' ou 'DDoS' et la probabilité DDoS via predict_proba.
    """
    pred = get_predictor()
    try:
        resultat = pred.predire_unitaire(payload.to_features_dict())
        return SinglePredictionResponse(**resultat)
    except FeatureValidationError as err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(err)) from err
    except (RuntimeError, ValueError) as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erreur d'inférence : {err}"
        ) from err


@app.post(f"{settings.API_PREFIX}/predict-csv", response_model=CsvPredictionResponse, tags=["Inférence"])
async def predict_csv(
    file: Annotated[UploadFile, File(description="Fichier CSV de flux réseau")]
) -> CsvPredictionResponse:
    """
    Analyse un fichier CSV par lot (taille max: 50 Mo, réponse 413 si dépassée).
    Valide la présence des 9 colonnes (réponse 422 avec liste des colonnes manquantes si absent).
    Retourne total_rows, error_rows, normal_count, ddos_count et les lignes paginables.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Format de fichier invalide. Seuls les fichiers .csv sont acceptés.",
        )

    # Vérification de la limite de 50 Mo avec réponse 413
    contenu = await file.read(settings.MAX_UPLOAD_SIZE + 1)
    if len(contenu) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Fichier trop volumineux. La taille maximale autorisée est de {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} Mo.",
        )

    pred = get_predictor()

    try:
        summary, rows, top_suspicious, score_histogram, _ = pred.predire_csv(
            contenu, nom_fichier=file.filename
        )
        return CsvPredictionResponse(
            summary=summary,
            rows=rows,
            filename=file.filename,
            top_suspicious=top_suspicious,
            score_histogram=score_histogram,
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
    Traite le CSV et retourne le fichier enrichi avec les colonnes
    Attack_Watcher_Prediction et DDoS_Probability en téléchargement (limite : 50 Mo).
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Seuls les fichiers .csv sont acceptés pour le téléchargement enrichi.",
        )

    contenu = await file.read(settings.MAX_UPLOAD_SIZE + 1)
    if len(contenu) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Fichier trop volumineux. La taille maximale autorisée est de {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} Mo.",
        )

    pred = get_predictor()

    try:
        _, _, _, _, csv_str = pred.predire_csv(contenu, nom_fichier=file.filename)
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
