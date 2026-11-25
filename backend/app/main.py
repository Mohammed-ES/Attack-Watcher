"""
Application FastAPI principale pour Attack Watcher.
API REST pour la détection DDoS basée sur un modèle Random Forest et SimpleImputer.
"""

from __future__ import annotations

import hmac
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import (
    Depends,
    FastAPI,
    File,
    Header,
    HTTPException,
    Response,
    UploadFile,
    status,
)
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
    TpStatsResponse,
    TpSubmitRequest,
    TpSubmitResponse,
    TpTestFeaturesResponse,
    TpVerifyResponse,
)
from backend.app.tp_service import evaluate_student_submit, load_test_features
from backend.app.tp_store import (
    count_daily_submits,
    get_tp_stats,
    hash_token,
    init_tp_db,
    is_valid_student_token,
    record_tp_event,
)
from backend.app.tp_verifier import verify_tp_submission

predictor_service: AttackPredictor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialise le moteur d'inférence et la base de suivi TP au démarrage."""
    global predictor_service
    init_tp_db()
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


def _extract_token(
    authorization: str | None = Header(default=None),
    x_student_token: str | None = Header(default=None),
) -> str | None:
    if x_student_token and x_student_token.strip():
        return x_student_token.strip()
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization[7:].strip()
        if tok:
            return tok
    return None


def require_student_token(
    authorization: str | None = Header(default=None),
    x_student_token: str | None = Header(default=None),
) -> str:
    """Vérifie la présence et la validité (non révoquée) d'un jeton étudiant."""
    raw_token = _extract_token(authorization=authorization, x_student_token=x_student_token)
    if not raw_token or not is_valid_student_token(raw_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton étudiant manquant, inconnu ou révoqué.",
        )
    return raw_token


def require_admin_token(
    authorization: str | None = Header(default=None),
    x_admin_token: str | None = Header(default=None),
) -> None:
    """Vérifie le jeton d'administration ADMIN_TOKEN."""
    expected = settings.ADMIN_TOKEN.strip()
    provided = None
    if x_admin_token and x_admin_token.strip():
        provided = x_admin_token.strip()
    elif authorization and authorization.lower().startswith("bearer "):
        provided = authorization[7:].strip()

    if not expected or not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Accès administrateur refusé : ADMIN_TOKEN invalide ou manquant.",
        )


@app.post(f"{settings.API_PREFIX}/tp/verify", response_model=TpVerifyResponse, tags=["Vérification TP"])
async def verify_tp(
    json_file: Annotated[UploadFile, File(description="Fichier JSON resultats_TP_NOM.json")],
    csv_file: Annotated[UploadFile, File(description="Fichier CSV predictions_TP_NOM.csv")],
    authorization: str | None = Header(default=None),
    x_student_token: str | None = Header(default=None),
) -> TpVerifyResponse:
    """
    Vérifie un rendu de TP étudiant (resultats_TP_NOM.json + predictions_TP_NOM.csv) :
    schéma JSON, cohérence interne, reproductibilité avec model.joblib,
    version scikit-learn et champs partie7_application.
    Aucun fichier n'est conservé après vérification.
    """
    raw_token = _extract_token(authorization=authorization, x_student_token=x_student_token)
    actor_hash = hash_token(raw_token if raw_token else "anonymous")

    if not json_file.filename or not json_file.filename.lower().endswith(".json"):
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Format invalide pour json_file. Un fichier .json est attendu.",
        )
    if not csv_file.filename or not csv_file.filename.lower().endswith(".csv"):
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Format invalide pour csv_file. Un fichier .csv est attendu.",
        )

    json_bytes = await json_file.read(settings.TP_MAX_UPLOAD_SIZE + 1)
    if len(json_bytes) > settings.TP_MAX_UPLOAD_SIZE:
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Fichier JSON trop volumineux. La taille maximale autorisée pour le TP est de {settings.TP_MAX_UPLOAD_SIZE // (1024 * 1024)} Mo.",
        )

    csv_bytes = await csv_file.read(settings.TP_MAX_UPLOAD_SIZE + 1)
    if len(csv_bytes) > settings.TP_MAX_UPLOAD_SIZE:
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Fichier CSV trop volumineux. La taille maximale autorisée pour le TP est de {settings.TP_MAX_UPLOAD_SIZE // (1024 * 1024)} Mo.",
        )

    pred = get_predictor()

    try:
        report = verify_tp_submission(json_bytes, csv_bytes, pred)
        record_tp_event(actor_hash, "verify_ok")
        return TpVerifyResponse(**report)
    except FeatureValidationError as err:
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(err)) from err
    except (RuntimeError, ValueError) as err:
        record_tp_event(actor_hash, "verify_error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification du TP : {err}",
        ) from err


@app.get(
    f"{settings.API_PREFIX}/tp/test-features",
    response_model=TpTestFeaturesResponse,
    tags=["Vérification TP"],
)
async def get_tp_test_features(
    _token: Annotated[str, Depends(require_student_token)],
) -> TpTestFeaturesResponse:
    """
    Renvoie ~500 lignes du jeu de test avec un id et les 9 features uniquement.
    Aucune étiquette, aucun Label, aucun Target.
    """
    pred = get_predictor()
    try:
        rows = load_test_features(pred.feature_names, limit=500)
        return TpTestFeaturesResponse(
            count=len(rows),
            features=pred.feature_names,
            rows=rows,
        )
    except FileNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err),
        ) from err
    except FeatureValidationError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(err),
        ) from err


@app.post(
    f"{settings.API_PREFIX}/tp/submit",
    response_model=TpSubmitResponse,
    tags=["Vérification TP"],
)
async def submit_tp_predictions(
    payload: TpSubmitRequest,
    token: Annotated[str, Depends(require_student_token)],
) -> TpSubmitResponse:
    """
    Évalue les prédictions étudiantes ({id, pred}) sur le jeu de test.
    Limite : 5 soumissions par jour et par jeton (429 au-delà).
    Renvoie uniquement recall, précision, F1 et taux de faux positifs.
    """
    t_hash = hash_token(token)
    if count_daily_submits(t_hash) >= settings.TP_DAILY_SUBMIT_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Limite quotidienne atteinte : 5 soumissions maximum par jour et par jeton.",
        )

    try:
        metrics = evaluate_student_submit(
            [{"id": item.id, "pred": item.pred} for item in payload.predictions]
        )
        record_tp_event(t_hash, "submit_ok")
        return TpSubmitResponse(**metrics)
    except FileNotFoundError as err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(err),
        ) from err
    except FeatureValidationError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(err),
        ) from err


@app.get(
    f"{settings.API_PREFIX}/admin/tp-stats",
    response_model=TpStatsResponse,
    tags=["Administration"],
)
async def admin_tp_stats(
    _: Annotated[None, Depends(require_admin_token)],
) -> TpStatsResponse:
    """Statistiques anonymisées de suivi des TP (protégé par ADMIN_TOKEN)."""
    stats = get_tp_stats()
    return TpStatsResponse(**stats)
