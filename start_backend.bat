@echo off
cd /d "%~dp0"
echo [Attack Watcher] Lancement du serveur FastAPI...
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --port 8000
pause

