"""
Point d'entree Hugging Face Spaces combinant l'API FastAPI et l'interface Gradio.
"""

from backend.app.main import app as fastapi_app

try:
    import gradio as gr

    with gr.Blocks(title="Attack Watcher API") as demo:
        gr.Markdown("# Attack Watcher - API de Detection DDoS")
        gr.Markdown("Le backend FastAPI est en ligne et operationnel.")
        gr.Markdown("- [Documentation interactive Swagger](/docs)")
        gr.Markdown("- [Verification de statut (Health check)](/api/health)")

    app = gr.mount_gradio_app(fastapi_app, demo, path="/")
except Exception:
    app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
