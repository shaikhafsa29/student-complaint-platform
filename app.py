from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
from datetime import datetime
import sqlite3
import uuid
import os
import secrets


app = Flask(__name__)
CORS(app)

PROJECT_DIR = Path(__file__).resolve().parent

RAILWAY_VOLUME = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")

if RAILWAY_VOLUME:
    DATABASE_PATH = Path(RAILWAY_VOLUME) / "complaints.db"
else:
    DATABASE_PATH = PROJECT_DIR / "complaints.db"


ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vemu123")


ALLOWED_RECIPIENTS = [
    "Class Teacher",
    "HOD",
    "Principal"
]

ALLOWED_STATUSES = [
    "Submitted",
    "Under Review",
    "In Progress",
    "Resolved"
]


admin_tokens = set()


def get_db():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(
        DATABASE_PATH,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


def create_database():
    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            roll_no TEXT NOT NULL,
            year TEXT NOT NULL,
            branch TEXT NOT NULL,
            category TEXT NOT NULL,
            recipient TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Submitted',
            created_at TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()


def generate_complaint_id():
    while True:
        complaint_id = "CMP-" + uuid.uuid4().hex[:8].upper()

        connection = get_db()

        existing = connection.execute(
            "SELECT complaint_id FROM complaints WHERE complaint_id = ?",
            (complaint_id,)
        ).fetchone()

        connection.close()

        if existing is None:
            return complaint_id


def is_admin_authenticated():
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        return False

    token = authorization.replace("Bearer ", "", 1).strip()

    return token in admin_tokens


@app.route("/")
def home():
    return send_from_directory(PROJECT_DIR, "index.html")


@app.route("/<path:filename>")
def serve_frontend(filename):
    file_path = PROJECT_DIR / filename

    if file_path.is_file():
        return send_from_directory(PROJECT_DIR, filename)

    return jsonify({
        "error": "Page not found"
    }), 404


@app.route("/api/health", methods=["GET"])
def health():
    try:
        connection = get_db()

        connection.execute(
            "SELECT 1"
        ).fetchone()

        connection.close()

        return jsonify({
            "status": "ok",
            "message": "VEMU Voice backend is running"
        })

    except Exception:
        return jsonify({
            "status": "error",
            "message": "Database connection failed"
        }), 500


@app.route("/api/student/login", methods=["POST"])
def student_login():
    data = request.get_json(silent=True) or {}

    roll_no = str(
        data.get("roll_no", "")
    ).strip()

    if not roll_no:
        return jsonify({
            "success": False,
            "message": "Please enter your Roll Number."
        }), 400

    if len(roll_no) > 50:
        return jsonify({
            "success": False,
            "message": "Roll Number is too long."
        }), 400

    return jsonify({
        "success": True,
        "message": "Student login successful.",
        "roll_no": roll_no
    })


@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}

    username = str(
        data.get("username", "")
    ).strip()

    password = str(
        data.get("password", "")
    )

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        return jsonify({
            "success": False,
            "message": "Invalid admin username or password."
        }), 401

    token = secrets.token_urlsafe(32)

    admin_tokens.add(token)

    return jsonify({
        "success": True,
        "message": "Admin login successful.",
        "token": token
    })


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    authorization = request.headers.get("Authorization", "")

    if authorization.startswith("Bearer "):
        token = authorization.replace(
            "Bearer ", "", 1
        ).strip()

        admin_tokens.discard(token)

    return jsonify({
        "success": True
    })


@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    data = request.get_json(silent=True) or {}

    roll_no = str(
        data.get("roll_no", "")
    ).strip()

    year = str(
        data.get("year", "")
    ).strip()

    branch = str(
        data.get("branch", "")
    ).strip()

    category = str(
        data.get("category", "")
    ).strip()

    recipient = str(
        data.get("recipient", "")
    ).strip()

    message = str(
        data.get("message", "")
    ).strip()

    if not roll_no:
        return jsonify({
            "success": False,
            "message": "Roll Number is required."
        }), 400

    if not year:
        return jsonify({
            "success": False,
            "message": "Please select your year."
        }), 400

    if not branch:
        return jsonify({
            "success": False,
            "message": "Please select your branch."
        }), 400

    if not category:
        return jsonify({
            "success": False,
            "message": "Please select a complaint category."
        }), 400

    if recipient not in ALLOWED_RECIPIENTS:
        return jsonify({
            "success": False,
            "message": "Please select a valid recipient."
        }), 400

    if not message:
        return jsonify({
            "success": False,
            "message": "Please enter your complaint."
        }), 400

    if len(message) > 1000:
        return jsonify({
            "success": False,
            "message": "Complaint cannot exceed 1000 characters."
        }), 400

    complaint_id = generate_complaint_id()

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    connection = get_db()

    connection.execute(
        """
        INSERT INTO complaints
        (
            complaint_id,
            roll_no,
            year,
            branch,
            category,
            recipient,
            message,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            complaint_id,
            roll_no,
            year,
            branch,
            category,
            recipient,
            message,
            "Submitted",
            created_at
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Complaint submitted successfully.",
        "complaint_id": complaint_id
    }), 201


@app.route("/api/complaints/<complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    complaint_id = complaint_id.strip().upper()

    connection = get_db()

    complaint = connection.execute(
        """
        SELECT
            complaint_id,
            year,
            branch,
            category,
            recipient,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = ?
        """,
        (complaint_id,)
    ).fetchone()

    connection.close()

    if complaint is None:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "complaint": dict(complaint)
    })


@app.route("/api/complaints", methods=["GET"])
def get_all_complaints():
    if not is_admin_authenticated():
        return jsonify({
            "success": False,
            "message": "Admin authentication required."
        }), 401

    connection = get_db()

    complaints = connection.execute(
        """
        SELECT
            complaint_id,
            roll_no,
            year,
            branch,
            category,
            recipient,
            message,
            status,
            created_at
        FROM complaints
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "complaints": [
            dict(complaint)
            for complaint in complaints
        ]
    })


@app.route("/api/complaints/<complaint_id>/status", methods=["PUT"])
def update_complaint_status(complaint_id):
    if not is_admin_authenticated():
        return jsonify({
            "success": False,
            "message": "Admin authentication required."
        }), 401

    data = request.get_json(silent=True) or {}

    status = str(
        data.get("status", "")
    ).strip()

    if status not in ALLOWED_STATUSES:
        return jsonify({
            "success": False,
            "message": "Invalid complaint status."
        }), 400

    complaint_id = complaint_id.strip().upper()

    connection = get_db()

    cursor = connection.execute(
        """
        UPDATE complaints
        SET status = ?
        WHERE complaint_id = ?
        """,
        (
            status,
            complaint_id
        )
    )

    connection.commit()

    updated = cursor.rowcount

    connection.close()

    if updated == 0:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Complaint status updated successfully."
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "The requested page or resource was not found."
    }), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({
        "error": "Internal server error."
    }), 500


create_database()


if __name__ == "__main__":
    port = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
