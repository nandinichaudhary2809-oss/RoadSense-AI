from auth import router as auth_router
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Literal
import sqlite3
from pathlib import Path

app = FastAPI(
    title="RoadSense AI API",
    description="Road intelligence API for community-submitted road reports, severity tracking, and map coordinates.",
    version="1.0.0",
    docs_url=None,
    redoc_url="/redoc",
)
app.include_router(auth_router)

SWAGGER_UI_STYLES = """
<style>
  body {
    background: #f3f6fa !important;
  }

  .swagger-ui {
    font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
  }

  .swagger-ui .topbar {
    display: none;
  }

  .swagger-ui .information-container.wrapper {
    padding: 28px 0 8px;
  }

  .swagger-ui .information-container .info {
    margin: 0;
    max-width: none;
  }

  .swagger-ui .info .title {
    font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #ffffff;
  }

  .swagger-ui .info hgroup.main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 0 16px;
    padding: 22px 24px;
    background: linear-gradient(135deg, #0f1c2e 0%, #16324f 58%, #0d9488 160%);
    border-radius: 18px;
    box-shadow: 0 12px 30px rgba(15, 28, 46, 0.18);
  }

  .swagger-ui .info hgroup.main a {
    margin: 0;
  }

  .swagger-ui .info .main .link,
  .swagger-ui .info .main .url {
    color: #c9ddf5 !important;
    font-size: 13px;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    padding: 6px 10px;
  }

  .swagger-ui .info .title small {
    top: 0;
  }

  .swagger-ui .info .title small pre {
    background: #2563eb;
    color: #ffffff;
    border-radius: 999px;
    padding: 4px 8px;
    font-size: 11px;
  }

  .swagger-ui .info .title small.version-stamp {
    background: transparent;
  }

  .swagger-ui .info .title small.version-stamp pre {
    background: #0d9488;
  }

  .swagger-ui .info .description,
  .swagger-ui .info .description p {
    color: #5b6b80;
    font-size: 15px;
    max-width: 720px;
  }

  .swagger-ui .scheme-container {
    background: transparent;
    box-shadow: none;
    padding: 0 0 12px;
  }

  .swagger-ui .opblock {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(15, 28, 46, 0.05);
  }
</style>
"""


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    swagger_ui = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="RoadSense AI API",
    )
    html = swagger_ui.body.decode("utf-8").replace(
        "</head>",
        f'<link rel="preconnect" href="https://fonts.googleapis.com">'
        f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap">'
        f"{SWAGGER_UI_STYLES}</head>",
    )
    return HTMLResponse(html)

DATABASE = Path(__file__).resolve().parent / "roadsense.db"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                latitude REAL,
                longitude REAL,
                created_at TEXT
            )
        """)

        # Add coordinates to an existing database if needed
        columns = {
            row[1]
            for row in conn.execute("PRAGMA table_info(reports)")
        }

        if "latitude" not in columns:
            conn.execute("ALTER TABLE reports ADD COLUMN latitude REAL")

        if "longitude" not in columns:
            conn.execute("ALTER TABLE reports ADD COLUMN longitude REAL")

        if "created_at" not in columns:
            conn.execute("ALTER TABLE reports ADD COLUMN created_at TEXT")


init_db()


class Report(BaseModel):
    location: str
    severity: Literal["Low", "Medium", "High"]
    description: str
    latitude: float | None = None
    longitude: float | None = None


@app.get("/")
def home():
    return {"message": "RoadSense AI backend is running!"}

@app.get("/reports")
def get_reports():
    with sqlite3.connect(DATABASE) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM reports ORDER BY id DESC"
        ).fetchall()
        return [dict(row) for row in rows]


@app.post("/reports")
def create_report(report: Report):
    created_at = utc_now_iso()

    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute(
            """
            INSERT INTO reports (
                location, severity, description, latitude, longitude, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                report.location,
                report.severity,
                report.description,
                report.latitude,
                report.longitude,
                created_at,
            ),
        )

        report_id = cursor.lastrowid

    return {
        "id": report_id,
        "location": report.location,
        "severity": report.severity,
        "description": report.description,
        "status": "Pending",
        "latitude": report.latitude,
        "longitude": report.longitude,
        "created_at": created_at,
    }

