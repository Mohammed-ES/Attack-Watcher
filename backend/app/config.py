"""
Configuration centralisée du backend Attack Watcher.
"""

from pathlib import Path
from typing import ClassVar


class Settings:
    PROJECT_NAME: str = "Attack Watcher API"
    PROJECT_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Chemins absolus résolus dynamiquement
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent
    ROOT_DIR: Path = BACKEND_DIR.parent
    ARTIFACTS_DIR: Path = ROOT_DIR / "ml" / "artifacts"

    MODEL_PATH: Path = ARTIFACTS_DIR / "model.joblib"
    SCALER_PATH: Path = ARTIFACTS_DIR / "scaler.joblib"
    FEATURES_PATH: Path = ARTIFACTS_DIR / "features.json"

    # Configuration CORS
    CORS_ORIGINS: ClassVar[list[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


settings = Settings()
