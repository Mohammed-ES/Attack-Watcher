"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface Gradio.
"""

from backend.app.main import app as fastapi_app

# pyright: reportMissingImports=false
# pyrefly: disable=missing-import
try:
    import gradio as gr  # type: ignore[import-not-found]

    with gr.Blocks(title="Attack Watcher API") as demo:
        gr.Markdown("# Attack Watcher - API de Detection DDoS")
        gr.Markdown("Le backend FastAPI est en ligne et operationnel.")
        gr.Markdown("- [Documentation interactive Swagger](/docs)")
        gr.Markdown("- [Verification de statut (Health check)](/api/health)")

    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
    demo.launch(server_name="0.0.0.0", server_port=7860, ssr_mode=False)
except Exception:
    app = fastapi_app
