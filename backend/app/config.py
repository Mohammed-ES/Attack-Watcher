"""
Configuration centralisée du backend Attack Watcher.
Définit les chemins absolus et les contraintes opérationnelles (taille d'upload, origines CORS).
"""

from pathlib import Path
from typing import ClassVar


class Settings:
    PROJECT_NAME: str = "Attack Watcher API"
    PROJECT_VERSION: str = "1.1.0"
    API_PREFIX: str = "/api"

    # Chemins absolus résolus dynamiquement
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent
    ROOT_DIR: Path = BACKEND_DIR.parent
    ARTIFACTS_DIR: Path = (ROOT_DIR / "ml" / "artifacts").resolve()

    MODEL_PATH: Path = (ARTIFACTS_DIR / "model.joblib").resolve()
    FEATURES_PATH: Path = (ARTIFACTS_DIR / "features.json").resolve()

    # Limite de taille de fichier pour les téléversements CSV (50 Mo max)
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50 Mo

    # Configuration CORS
    CORS_ORIGINS: ClassVar[list[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
