
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import sqlite3
from pathlib import Path

app = FastAPI(title="RoadSense AI API")

DATABASE = Path(__file__).resolve().parent / "roadsense.db"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
                longitude REAL
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
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute(
            """
            INSERT INTO reports (
                location, severity, description, latitude, longitude
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                report.location,
                report.severity,
                report.description,
                report.latitude,
                report.longitude,
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
    }

