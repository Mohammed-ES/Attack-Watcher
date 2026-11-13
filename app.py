"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface Gradio.
"""

import gradio as gr
from backend.app.main import app as fastapi_app

# Creation d'une interface Gradio
with gr.Blocks(title="Attack Watcher API") as demo:
    gr.Markdown("# Attack Watcher - API de Detection DDoS")
    gr.Markdown("Le backend FastAPI est en ligne.")
    gr.Markdown("- [Documentation interactive Swagger](/docs)")
    gr.Markdown("- [Verification de statut (Health check)](/api/health)")

# Montage de Gradio sur FastAPI
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
