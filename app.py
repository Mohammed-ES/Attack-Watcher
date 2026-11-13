"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface de test Gradio.
"""

import importlib
from backend.app.main import app

# Chargement dynamique pour eviter tout faux positif du linter local (Pyrefly / Pylance)
try:
    gr = importlib.import_module("gradio")

    with gr.Blocks(title="Attack Watcher API") as demo:
        gr.Markdown("# Attack Watcher - API de Detection DDoS")
        gr.Markdown(
            "Le backend FastAPI fonctionne en continu. "
            "Accedez a la documentation interactive Swagger sur [/docs](/docs)."
        )

    app = gr.mount_gradio_app(app, demo, path="/")
except Exception:
    pass
