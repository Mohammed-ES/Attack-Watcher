"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface de test Gradio.
"""

from backend.app.main import app

try:
    import gradio as gr

    # Interface Gradio pour Hugging Face Spaces
    with gr.Blocks(title="Attack Watcher API") as demo:
        gr.Markdown("# Attack Watcher - API de Detection DDoS")
        gr.Markdown(
            "Le backend FastAPI fonctionne en continu. "
            "Accedez a la documentation interactive Swagger sur [/docs](/docs)."
        )

    # Montage de Gradio sur l'application FastAPI
    app = gr.mount_gradio_app(app, demo, path="/")
except ImportError:
    # Si gradio n'est pas installe localement, FastAPI fonctionne normalement
    pass
