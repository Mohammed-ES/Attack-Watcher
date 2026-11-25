"""
Gestion côté serveur des jetons étudiants révocables et du suivi anonymisé (tp_events).
Utilise SQLite avec hachage SHA-256 des jetons. Aucun nom d'étudiant n'est stocké.
"""

from __future__ import annotations

import hashlib
import sqlite3
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

from backend.app.config import settings


def hash_token(raw_token: str) -> str:
    """Retourne le hash SHA-256 hexadécimal d'un jeton."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    target = db_path or settings.TP_DB_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_tp_db(db_path: Path | None = None) -> None:
    """Initialise les tables student_tokens et tp_events, et enregistre STUDENT_TOKENS."""
    with _get_connection(db_path) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS student_tokens (
                token_hash TEXT PRIMARY KEY,
                revoked INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                revoked_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tp_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token_hash TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('verify_ok', 'verify_error', 'submit_ok')),
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_tp_events_type_date ON tp_events(type, created_at)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_tp_events_token_date ON tp_events(token_hash, created_at)"
        )

        # Provisionnement initial depuis STUDENT_TOKENS (sans réactiver un jeton déjà révoqué)
        raw_tokens = settings.STUDENT_TOKENS.strip()
        if raw_tokens:
            now = datetime.now(UTC).isoformat()
            for tok in (t.strip() for t in raw_tokens.split(",") if t.strip()):
                t_hash = hash_token(tok)
                conn.execute(
                    """
                    INSERT OR IGNORE INTO student_tokens (token_hash, revoked, created_at)
                    VALUES (?, 0, ?)
                    """,
                    (t_hash, now),
                )
        conn.commit()


def register_student_token(raw_token: str, db_path: Path | None = None) -> str:
    """Enregistre ou réactive un jeton étudiant et retourne son token_hash."""
    init_tp_db(db_path)
    t_hash = hash_token(raw_token)
    now = datetime.now(UTC).isoformat()
    with _get_connection(db_path) as conn:
        conn.execute(
            """
            INSERT INTO student_tokens (token_hash, revoked, created_at, revoked_at)
            VALUES (?, 0, ?, NULL)
            ON CONFLICT(token_hash) DO UPDATE SET revoked = 0, revoked_at = NULL
            """,
            (t_hash, now),
        )
        conn.commit()
    return t_hash


def revoke_student_token(raw_token: str, db_path: Path | None = None) -> None:
    """Révoque un jeton étudiant."""
    init_tp_db(db_path)
    t_hash = hash_token(raw_token)
    now = datetime.now(UTC).isoformat()
    with _get_connection(db_path) as conn:
        conn.execute(
            "UPDATE student_tokens SET revoked = 1, revoked_at = ? WHERE token_hash = ?",
            (now, t_hash),
        )
        conn.commit()


def is_valid_student_token(raw_token: str, db_path: Path | None = None) -> bool:
    """Vérifie qu'un jeton existe et n'est pas révoqué."""
    if not raw_token or not raw_token.strip():
        return False
    init_tp_db(db_path)
    t_hash = hash_token(raw_token.strip())
    with _get_connection(db_path) as conn:
        row = conn.execute(
            "SELECT revoked FROM student_tokens WHERE token_hash = ?",
            (t_hash,),
        ).fetchone()
    return row is not None and int(row["revoked"]) == 0


def count_daily_submits(token_hash: str, db_path: Path | None = None) -> int:
    """Compte les soumissions 'submit_ok' du jour UTC courant pour un token_hash."""
    init_tp_db(db_path)
    today_prefix = datetime.now(UTC).strftime("%Y-%m-%d")
    with _get_connection(db_path) as conn:
        row = conn.execute(
            """
            SELECT COUNT(*) AS cnt
            FROM tp_events
            WHERE token_hash = ? AND type = 'submit_ok' AND created_at LIKE ?
            """,
            (token_hash, f"{today_prefix}%"),
        ).fetchone()
    return int(row["cnt"]) if row else 0


def record_tp_event(
    token_hash: str,
    event_type: str,
    db_path: Path | None = None,
) -> None:
    """Enregistre un événement anonymisé dans tp_events (aucun nom d'étudiant)."""
    init_tp_db(db_path)
    now = datetime.now(UTC).isoformat()
    with _get_connection(db_path) as conn:
        conn.execute(
            "INSERT INTO tp_events (token_hash, type, created_at) VALUES (?, ?, ?)",
            (token_hash, event_type, now),
        )
        conn.commit()


def get_tp_stats(db_path: Path | None = None) -> dict[str, Any]:
    """Calcule les statistiques agrégées des événements TP pour /api/admin/tp-stats."""
    init_tp_db(db_path)
    since_24h = (datetime.now(UTC) - timedelta(hours=24)).isoformat()
    with _get_connection(db_path) as conn:
        distinct_row = conn.execute(
            "SELECT COUNT(DISTINCT token_hash) AS cnt FROM tp_events WHERE type = 'verify_ok'"
        ).fetchone()
        verify_ok_row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM tp_events WHERE type = 'verify_ok'"
        ).fetchone()
        verify_err_row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM tp_events WHERE type = 'verify_error'"
        ).fetchone()
        submit_ok_row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM tp_events WHERE type = 'submit_ok'"
        ).fetchone()
        last_24h_rows = conn.execute(
            """
            SELECT type, COUNT(*) AS cnt
            FROM tp_events
            WHERE created_at >= ?
            GROUP BY type
            """,
            (since_24h,),
        ).fetchall()

    last_24h_map = {"verify_ok": 0, "verify_error": 0, "submit_ok": 0}
    for row in last_24h_rows:
        last_24h_map[row["type"]] = int(row["cnt"])

    total_verify_ok = int(verify_ok_row["cnt"]) if verify_ok_row else 0
    total_verify_error = int(verify_err_row["cnt"]) if verify_err_row else 0
    total_submit_ok = int(submit_ok_row["cnt"]) if submit_ok_row else 0

    return {
        "distinct_students": int(distinct_row["cnt"]) if distinct_row else 0,
        "total_imports": total_verify_ok,
        "total_errors": total_verify_error,
        "total_submits": total_submit_ok,
        "last_24h": {
            "verify_ok": last_24h_map["verify_ok"],
            "verify_error": last_24h_map["verify_error"],
            "submit_ok": last_24h_map["submit_ok"],
            "total": sum(last_24h_map.values()),
        },
    }
