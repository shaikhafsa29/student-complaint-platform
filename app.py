from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
import os
from datetime import datetime
from pathlib import Path

# =========================================================
# APP CONFIGURATION
# =========================================================

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
    return response

# =========================================================
# PROJECT PATHS
# =========================================================

# Root directory where frontend HTML, CSS, JS, and backend app.py reside
PROJECT_DIR = Path(__file__).resolve().parent

# =========================================================
# DATABASE CONFIGURATION
# =========================================================

# Railway Volume support or local database file
RAILWAY_VOLUME = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")

if RAILWAY_VOLUME:
    DATABASE = os.path.join(RAILWAY_VOLUME, "complaints.db")
else:
    DATABASE = os.path.join(PROJECT_DIR, "complaints.db")

# =========================================================
# ADMIN CREDENTIALS
# =========================================================

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vemu123")

# =========================================================
# DATABASE CONNECTION & MIGRATION
# =========================================================

def get_db_connection():
    conn = sqlite3.connect(DATABASE, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def init_and_migrate_db():
    database_directory = os.path.dirname(DATABASE)
    if database_directory:
        os.makedirs(database_directory, exist_ok=True)

    conn = get_db_connection()

    # Create table if not exists with all required columns
    conn.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            roll_no TEXT NOT NULL DEFAULT '',
            year TEXT NOT NULL,
            branch TEXT NOT NULL,
            category TEXT NOT NULL,
            recipient TEXT NOT NULL DEFAULT 'Class Teacher',
            message TEXT NOT NULL,
            status TEXT DEFAULT 'Submitted',
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()

    # Safely migrate existing databases if columns are missing
    cursor = conn.execute("PRAGMA table_info(complaints)")
    columns = [row["name"] for row in cursor.fetchall()]

    if "roll_no" not in columns:
        conn.execute("ALTER TABLE complaints ADD COLUMN roll_no TEXT DEFAULT ''")
        conn.commit()

    if "recipient" not in columns:
        conn.execute("ALTER TABLE complaints ADD COLUMN recipient TEXT DEFAULT 'Class Teacher'")
        conn.commit()

    conn.close()

# Initialize / migrate on startup
init_and_migrate_db()

# =========================================================
# FRONTEND FILE SERVING
# =========================================================

@app.route("/")
def home():
    return send_from_directory(PROJECT_DIR, "index.html")

@app.route("/<path:filename>")
def serve_static(filename):
    file_path = PROJECT_DIR / filename
    if file_path.is_file():
        return send_from_directory(PROJECT_DIR, filename)
    return send_from_directory(PROJECT_DIR, "index.html")

# =========================================================
# STUDENT LOGIN API
# =========================================================

@app.route("/api/student/login", methods=["POST"])
def student_login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "success": False,
            "message": "No login data received"
        }), 400

    roll_no = str(data.get("roll_no", "")).strip().upper()
    if not roll_no:
        return jsonify({
            "success": False,
            "message": "Please enter your Roll Number"
        }), 400

    return jsonify({
        "success": True,
        "message": "Student login successful",
        "roll_no": roll_no
    }), 200

# =========================================================
# ADMIN LOGIN API
# =========================================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "success": False,
            "message": "No login data received"
        }), 400

    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful"
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401

# =========================================================
# SUBMIT COMPLAINT API
# =========================================================

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "success": False,
            "message": "No complaint data received"
        }), 400

    roll_no = str(data.get("roll_no", "")).strip().upper()
    year = str(data.get("year", "")).strip()
    branch = str(data.get("branch", "")).strip()
    category = str(data.get("category", "")).strip()
    recipient = str(data.get("recipient", "")).strip()
    message = str(data.get("message", "")).strip()

    # Validation
    if not roll_no:
        return jsonify({
            "success": False,
            "message": "Student Roll Number is required. Please login again."
        }), 400

    if not year or not branch or not category or not recipient or not message:
        return jsonify({
            "success": False,
            "message": "Please fill in all required fields"
        }), 400

    # Validate recipient
    allowed_recipients = ["Class Teacher", "HOD", "Principal"]
    if recipient not in allowed_recipients:
        return jsonify({
            "success": False,
            "message": "Invalid recipient selected"
        }), 400

    # Generate unique complaint ID
    complaint_id = f"CMP-{uuid.uuid4().hex[:8].upper()}"
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        conn.execute("""
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
        """, (
            complaint_id,
            roll_no,
            year,
            branch,
            category,
            recipient,
            message,
            "Submitted",
            created_at
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Could not generate unique complaint ID. Please try again."
        }), 500
    finally:
        conn.close()

    return jsonify({
        "success": True,
        "message": "Complaint submitted successfully",
        "complaint_id": complaint_id,
        "roll_no": roll_no,
        "status": "Submitted",
        "created_at": created_at
    }), 201

# =========================================================
# GET ALL COMPLAINTS (ADMIN)
# =========================================================

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    conn = get_db_connection()
    complaints = conn.execute("""
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
    """).fetchall()
    conn.close()

    complaint_list = [dict(complaint) for complaint in complaints]
    return jsonify(complaint_list), 200

# =========================================================
# TRACK COMPLAINT BY ID
# =========================================================

@app.route("/api/complaints/<complaint_id>", methods=["GET"])
def track_complaint(complaint_id):
    complaint_id = complaint_id.strip().upper()

    conn = get_db_connection()
    complaint = conn.execute("""
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
        WHERE complaint_id = ?
    """, (complaint_id,)).fetchone()
    conn.close()

    if complaint is None:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "complaint": dict(complaint)
    }), 200

# =========================================================
# ADMIN VIEW COMPLAINT DETAILS
# =========================================================

@app.route("/api/admin/complaints/<complaint_id>/view", methods=["GET", "POST"])
def admin_view_complaint(complaint_id):
    complaint_id = complaint_id.strip().upper()

    conn = get_db_connection()
    complaint = conn.execute("""
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
        WHERE complaint_id = ?
    """, (complaint_id,)).fetchone()
    conn.close()

    if complaint is None:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Complaint retrieved successfully",
        "complaint": dict(complaint)
    }), 200

# =========================================================
# UPDATE COMPLAINT STATUS (ADMIN)
# =========================================================

def _perform_status_update(complaint_id):
    complaint_id = complaint_id.strip().upper()
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "message": "No status data received"
        }), 400

    new_status = str(data.get("status", "")).strip()
    allowed_statuses = ["Submitted", "Under Review", "In Progress", "Resolved"]

    if new_status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid complaint status"
        }), 400

    conn = get_db_connection()
    complaint = conn.execute("""
        SELECT complaint_id FROM complaints WHERE complaint_id = ?
    """, (complaint_id,)).fetchone()

    if complaint is None:
        conn.close()
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    conn.execute("""
        UPDATE complaints
        SET status = ?
        WHERE complaint_id = ?
    """, (new_status, complaint_id))
    conn.commit()

    updated_complaint = conn.execute("""
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
        WHERE complaint_id = ?
    """, (complaint_id,)).fetchone()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Complaint status updated successfully",
        "complaint": dict(updated_complaint)
    }), 200

@app.route("/api/complaints/<complaint_id>/status", methods=["PUT"])
def update_status(complaint_id):
    return _perform_status_update(complaint_id)

@app.route("/api/admin/complaints/<complaint_id>/status", methods=["PUT"])
def update_status_admin_alias(complaint_id):
    return _perform_status_update(complaint_id)

# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "message": "VEMU Voice Student Support Platform Backend Running",
        "database": "connected"
    }), 200

# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def page_not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({
            "success": False,
            "message": "API endpoint not found"
        }), 404
    return send_from_directory(PROJECT_DIR, "index.html")

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)
