from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
from datetime import datetime
import sqlite3
import uuid
import os


app = Flask(__name__)
CORS(app)


PROJECT_DIR = Path(__file__).resolve().parent

RAILWAY_VOLUME = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")

if RAILWAY_VOLUME:
    DATABASE = Path(RAILWAY_VOLUME) / "complaints.db"
else:
    DATABASE = PROJECT_DIR / "complaints.db"


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


def get_db():
    connection = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    connection.row_factory = sqlite3.Row

    return connection


def create_database():
    DATABASE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            roll_no TEXT,
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

    cursor.execute(
        "PRAGMA table_info(complaints)"
    )

    columns = [
        row["name"]
        for row in cursor.fetchall()
    ]

    if "roll_no" not in columns:
        cursor.execute(
            "ALTER TABLE complaints ADD COLUMN roll_no TEXT"
        )

    if "recipient" not in columns:
        cursor.execute(
            "ALTER TABLE complaints ADD COLUMN recipient TEXT DEFAULT 'HOD'"
        )

    if "status" not in columns:
        cursor.execute(
            "ALTER TABLE complaints ADD COLUMN status TEXT DEFAULT 'Submitted'"
        )

    if "created_at" not in columns:
        cursor.execute(
            "ALTER TABLE complaints ADD COLUMN created_at TEXT"
        )

    connection.commit()
    connection.close()


create_database()


@app.route("/")
def home():
    return send_from_directory(
        PROJECT_DIR,
        "index.html"
    )


@app.route("/<path:filename>")
def serve_file(filename):
    file_path = PROJECT_DIR / filename

    if file_path.exists() and file_path.is_file():
        return send_from_directory(
            PROJECT_DIR,
            filename
        )

    return jsonify({
        "error": "File not found"
    }), 404


@app.route("/api/health", methods=["GET"])
def health():
    try:
        connection = get_db()

        connection.execute(
            "SELECT 1"
        )

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
            "message": "Roll number is required"
        }), 400

    if len(roll_no) > 50:
        return jsonify({
            "success": False,
            "message": "Invalid roll number"
        }), 400

    return jsonify({
        "success": True,
        "message": "Student login successful",
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

    if (
        username == ADMIN_USERNAME
        and password == ADMIN_PASSWORD
    ):
        return jsonify({
            "success": True,
            "message": "Admin login successful"
        })

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401


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
            "message": "Roll number is required"
        }), 400

    if not year:
        return jsonify({
            "success": False,
            "message": "Year is required"
        }), 400

    if not branch:
        return jsonify({
            "success": False,
            "message": "Branch is required"
        }), 400

    if not category:
        return jsonify({
            "success": False,
            "message": "Category is required"
        }), 400

    if recipient not in ALLOWED_RECIPIENTS:
        return jsonify({
            "success": False,
            "message": "Invalid complaint recipient"
        }), 400

    if not message:
        return jsonify({
            "success": False,
            "message": "Complaint description is required"
        }), 400

    if len(message) > 1000:
        return jsonify({
            "success": False,
            "message": "Complaint must be 1000 characters or less"
        }), 400

    complaint_id = (
        "CMP-"
        + uuid.uuid4().hex[:8].upper()
    )

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
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
        "message": "Complaint submitted successfully",
        "complaint_id": complaint_id
    }), 201


@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
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
    )

    complaints = [
        dict(row)
        for row in cursor.fetchall()
    ]

    connection.close()

    return jsonify({
        "success": True,
        "complaints": complaints
    })


@app.route("/api/complaints/<complaint_id>", methods=["GET"])
def get_single_complaint(complaint_id):
    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
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
        WHERE complaint_id = ?
        """,
        (complaint_id.strip(),)
    )

    complaint = cursor.fetchone()

    connection.close()

    if complaint is None:
        return jsonify({
            "success": False,
            "message": "Complaint not found"
        }), 404

    return jsonify({
        "success": True,
        "complaint": dict(complaint)
    })


@app.route(
    "/api/complaints/<complaint_id>/status",
    methods=["PUT"]
)
def update_complaint_status(complaint_id):
    data = request.get_json(silent=True) or {}

    status = str(
        data.get("status", "")
    ).strip()

    if status not in ALLOWED_STATUSES:
        return jsonify({
            "success": False,
            "message": "Invalid complaint status",
            "allowed_statuses": ALLOWED_STATUSES
        }), 400

    connection = get_db()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT complaint_id
        FROM complaints
        WHERE complaint_id = ?
        """,
        (complaint_id.strip(),)
    )

    complaint = cursor.fetchone()

    if complaint is None:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Complaint not found"
        }), 404

    cursor.execute(
        """
        UPDATE complaints
        SET status = ?
        WHERE complaint_id = ?
        """,
        (
            status,
            complaint_id.strip()
        )
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Complaint status updated successfully",
        "complaint_id": complaint_id,
        "status": status
    })


@app.errorhandler(404)
def page_not_found(error):
    return jsonify({
        "success": False,
        "message": "Page not found"
    }), 404


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


if __name__ == "__main__":
    port = int(
        os.environ.get("PORT", 5000)
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
