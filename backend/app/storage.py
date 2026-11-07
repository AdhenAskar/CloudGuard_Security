import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from app.config import settings

def _connect():
    path = Path(settings.db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("""CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY, created_at TEXT NOT NULL, mode TEXT NOT NULL,
        account_id TEXT NOT NULL, region TEXT NOT NULL, findings_json TEXT NOT NULL
    )""")
    conn.commit()
    return conn

def save_scan(mode: str, account_id: str, region: str, findings: list[dict]):
    record = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "mode": mode,
        "account_id": account_id,
        "region": region,
        "summary": {
            "total_findings": len(findings),
            "critical": sum(f["severity"] == "CRITICAL" for f in findings),
            "high": sum(f["severity"] == "HIGH" for f in findings),
            "medium": sum(f["severity"] == "MEDIUM" for f in findings),
            "info": sum(f["severity"] == "INFO" for f in findings),
        },
        "findings": findings,
    }
    with _connect() as conn:
        conn.execute(
            "INSERT INTO scans VALUES (?, ?, ?, ?, ?, ?)",
            (record["id"], record["created_at"], mode, account_id, region, json.dumps(record)),
        )
    return record

def get_scan(scan_id: str):
    with _connect() as conn:
        row = conn.execute("SELECT findings_json FROM scans WHERE id = ?", (scan_id,)).fetchone()
    return json.loads(row["findings_json"]) if row else None
