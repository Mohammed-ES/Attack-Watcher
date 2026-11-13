"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface de test Gradio.
"""

import gradio as gr
from backend.app.main import app

# Interface Gradio minimale pour satisfaire le runtime Hugging Face Spaces
with gr.Blocks(title="Attack Watcher API") as demo:
    gr.Markdown("# Attack Watcher - API de Detection DDoS")
    gr.Markdown(
        "Le backend FastAPI fonctionne en continu. "
        "Vous pouvez acceder a la documentation Swagger interactive sur [/docs](/docs)."
    )

# Montage de Gradio sur l'application FastAPI existante
app = gr.mount_gradio_app(app, demo, path="/")
