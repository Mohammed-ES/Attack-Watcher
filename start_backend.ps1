Set-Location $PSScriptRoot
Write-Host "[Attack Watcher] Lancement du serveur FastAPI sur http://127.0.0.1:8000 ..." -ForegroundColor Cyan
& ".\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --reload --port 8000
