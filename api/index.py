"""
Point d'entree Serverless Vercel pour l'API FastAPI Attack Watcher.
"""

import sys
from pathlib import Path

# Ajouter la racine du projet au PYTHONPATH pour resoudre `backend` et `ml`
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
