"""
Configuration centralisée du backend Attack Watcher.
Définit les chemins absolus, les contraintes opérationnelles et les variables d'environnement.
"""

import os
from pathlib import Path
from typing import ClassVar


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if not raw:
        return []
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


class Settings:
    PROJECT_NAME: str = "Attack Watcher API"
    PROJECT_VERSION: str = "1.3.0"
    API_PREFIX: str = "/api"

    # Chemins absolus résolus dynamiquement à partir de Path(__file__)
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent
    ROOT_DIR: Path = BACKEND_DIR.parent
    ARTIFACTS_DIR: Path = (ROOT_DIR / "ml" / "artifacts").resolve()

    MODEL_PATH: Path = (ARTIFACTS_DIR / "model.joblib").resolve()
    FEATURES_PATH: Path = (ARTIFACTS_DIR / "features.json").resolve()

    # Limite de taille de fichier pour les téléversements CSV/JSON (50 Mo max, 5 Mo max pour le TP)
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 Mo (52 428 800 octets)
    TP_MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 Mo (5 242 880 octets)

    # Limite quotidienne de soumissions /api/tp/submit par jeton étudiant
    TP_DAILY_SUBMIT_LIMIT: int = 5

    # Variables d'environnement pour les TP et l'administration (secrets uniquement)
    ADMIN_TOKEN: str = os.getenv("ADMIN_TOKEN", "")
    TP_LABELS_PATH: str = os.getenv("TP_LABELS_PATH", "")
    TP_LABELS_JSON: str = os.getenv("TP_LABELS_JSON", "")
    TP_DB_PATH: Path = Path(
        os.getenv("TP_DB_PATH", str((ROOT_DIR / "data" / "tp_tracking.db").resolve()))
    )
    STUDENT_TOKENS: str = os.getenv("STUDENT_TOKENS", "")

    # Configuration CORS (lue depuis CORS_ORIGINS, aucune origine par défaut en production)
    CORS_ORIGINS: ClassVar[list[str]] = _parse_cors_origins()


settings = Settings()
