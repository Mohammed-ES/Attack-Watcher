# Tests de charge k6 (Staging uniquement)

> **IMPORTANT :** Ne jamais exécuter ce script contre l'environnement de production.  
> Utilisez exclusivement une instance locale ou un environnement de **staging** dédié.

## Prérequis

- [k6](https://k6.io/docs/get-started/installation/) installé.
- Un serveur backend de staging démarré avec `TP_LABELS_PATH` et `STUDENT_TOKENS` configurés.

## Commandes exactes pour lancer le test en staging

```bash
# Linux / macOS
STAGING_URL="https://staging-api.example.com" STUDENT_TOKEN="votre_jeton_staging" k6 run loadtest/tp_load.js
```

```powershell
# PowerShell (Windows)
$env:STAGING_URL = "https://staging-api.example.com"
$env:STUDENT_TOKEN = "votre_jeton_staging"
k6 run loadtest/tp_load.js
```
