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
CORS(app)


# =========================================================
# PROJECT PATHS
# =========================================================

# app.py and all frontend files are in the SAME folder
PROJECT_DIR = Path(__file__).resolve().parent


# =========================================================
# DATABASE CONFIGURATION
# =========================================================

# Railway Volume support
RAILWAY_VOLUME = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")

if RAILWAY_VOLUME:
    DATABASE = os.path.join(
        RAILWAY_VOLUME,
        "complaints.db"
    )
else:
    DATABASE = os.path.join(
        PROJECT_DIR,
        "complaints.db"
    )


# =========================================================
# ADMIN CREDENTIALS
# =========================================================

ADMIN_USERNAME = os.environ.get(
    "ADMIN_USERNAME",
    "admin"
)

ADMIN_PASSWORD = os.environ.get(
    "ADMIN_PASSWORD",
    "vemu123"
)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    conn = sqlite3.connect(
        DATABASE,
        timeout=10
    )

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# CREATE DATABASE
# =========================================================

def create_database():

    database_directory = os.path.dirname(DATABASE)

    if database_directory:
        os.makedirs(
            database_directory,
            exist_ok=True
        )

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS complaints (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            complaint_id TEXT UNIQUE NOT NULL,

            year TEXT NOT NULL,

            branch TEXT NOT NULL,

            category TEXT NOT NULL,

            message TEXT NOT NULL,

            status TEXT DEFAULT 'Submitted',

            created_at TEXT NOT NULL

        )
    """)

    conn.commit()

    conn.close()


# =========================================================
# FRONTEND FILE SERVING
# =========================================================

@app.route("/")
def home():

    return send_from_directory(
        PROJECT_DIR,
        "index.html"
    )


@app.route("/index.html")
def index_page():

    return send_from_directory(
        PROJECT_DIR,
        "index.html"
    )


@app.route("/about.html")
def about_page():

    return send_from_directory(
        PROJECT_DIR,
        "about.html"
    )


@app.route("/contact.html")
def contact_page():

    return send_from_directory(
        PROJECT_DIR,
        "contact.html"
    )


@app.route("/track.html")
def track_page():

    return send_from_directory(
        PROJECT_DIR,
        "track.html"
    )


@app.route("/admin-login.html")
def admin_login_page():

    return send_from_directory(
        PROJECT_DIR,
        "admin-login.html"
    )


@app.route("/admin-dashboard.html")
def admin_dashboard_page():

    return send_from_directory(
        PROJECT_DIR,
        "admin-dashboard.html"
    )
@app.route("/success.html")
def success_page():
    return send_from_directory(
        PROJECT_DIR,
        "success.html"
    )

# =========================================================
# FRONTEND CSS / JS
# =========================================================

@app.route("/style.css")
def style_css():

    return send_from_directory(
        PROJECT_DIR,
        "style.css"
    )


@app.route("/admin-dashboard.css")
def admin_dashboard_css():

    return send_from_directory(
        PROJECT_DIR,
        "admin-dashboard.css"
    )


@app.route("/script.js")
def script_js():

    return send_from_directory(
        PROJECT_DIR,
        "script.js"
    )


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.route(
    "/api/admin/login",
    methods=["POST"]
)
def admin_login():

    data = request.get_json(
        silent=True
    )

    if not data:

        return jsonify({
            "success": False,
            "message": "No login data received"
        }), 400

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

            "message": "Login successful"

        }), 200

    return jsonify({

        "success": False,

        "message": "Invalid username or password"

    }), 401


# =========================================================
# SUBMIT COMPLAINT
# =========================================================

@app.route(
    "/api/complaints",
    methods=["POST"]
)
def submit_complaint():

    data = request.get_json(
        silent=True
    )

    if not data:

        return jsonify({

            "success": False,

            "message": "No data received"

        }), 400

    year = str(
        data.get("year", "")
    ).strip()

    branch = str(
        data.get("branch", "")
    ).strip()

    category = str(
        data.get("category", "")
    ).strip()

    message = str(
        data.get("message", "")
    ).strip()

    # =====================================================
    # VALIDATION
    # =====================================================

    if (
        not year
        or not branch
        or not category
        or not message
    ):

        return jsonify({

            "success": False,

            "message": "Please fill in all required fields"

        }), 400

    # =====================================================
    # GENERATE UNIQUE COMPLAINT ID
    # =====================================================

    complaint_id = (
        f"CMP-{uuid.uuid4().hex[:8].upper()}"
    )

    # =====================================================
    # CURRENT DATE AND TIME
    # =====================================================

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # =====================================================
    # SAVE COMPLAINT
    # =====================================================

    conn = get_db_connection()

    try:

        conn.execute("""
            INSERT INTO complaints
            (
                complaint_id,
                year,
                branch,
                category,
                message,
                status,
                created_at
            )

            VALUES (?, ?, ?, ?, ?, ?, ?)

        """, (

            complaint_id,
            year,
            branch,
            category,
            message,
            "Submitted",
            created_at

        ))

        conn.commit()

    except sqlite3.IntegrityError:

        conn.close()

        return jsonify({

            "success": False,

            "message": "Could not generate complaint ID. Please try again."

        }), 500

    finally:

        conn.close()

    return jsonify({

        "success": True,

        "message": "Complaint submitted successfully",

        "complaint_id": complaint_id,

        "status": "Submitted",

        "created_at": created_at

    }), 201


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.route(
    "/api/complaints",
    methods=["GET"]
)
def get_complaints():

    conn = get_db_connection()

    complaints = conn.execute("""
        SELECT
            id,
            complaint_id,
            year,
            branch,
            category,
            message,
            status,
            created_at
        FROM complaints
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    complaint_list = [

        dict(complaint)

        for complaint in complaints

    ]

    return jsonify(
        complaint_list
    ), 200


# =========================================================
# TRACK COMPLAINT
# =========================================================

@app.route(
    "/api/complaints/<complaint_id>",
    methods=["GET"]
)
def track_complaint(complaint_id):

    complaint_id = (
        complaint_id.strip().upper()
    )

    conn = get_db_connection()

    complaint = conn.execute("""
        SELECT
            complaint_id,
            category,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = ?

    """, (
        complaint_id,
    )).fetchone()

    conn.close()

    if complaint is None:

        return jsonify({

            "success": False,

            "message": "Complaint ID not found"

        }), 404

    return jsonify({

        "success": True,

        "complaint": dict(
            complaint
        )

    }), 200


# =========================================================
# ADMIN VIEW COMPLAINT
#
# Submitted -> Under Review
# =========================================================

@app.route(
    "/api/admin/complaints/<complaint_id>/view",
    methods=["POST"]
)
def admin_view_complaint(complaint_id):

    complaint_id = (
        complaint_id.strip().upper()
    )

    conn = get_db_connection()

    complaint = conn.execute("""
        SELECT
            complaint_id,
            year,
            branch,
            category,
            message,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = ?

    """, (
        complaint_id,
    )).fetchone()

    if complaint is None:

        conn.close()

        return jsonify({

            "success": False,

            "message": "Complaint ID not found"

        }), 404

    # =====================================================
    # AUTOMATIC STATUS CHANGE
    # =====================================================

    if complaint["status"] == "Submitted":

        conn.execute("""
            UPDATE complaints

            SET status = ?

            WHERE complaint_id = ?

        """, (

            "Under Review",

            complaint_id

        ))

        conn.commit()

    # =====================================================
    # GET UPDATED COMPLAINT
    # =====================================================

    updated_complaint = conn.execute("""
        SELECT
            complaint_id,
            year,
            branch,
            category,
            message,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = ?

    """, (
        complaint_id,
    )).fetchone()

    conn.close()

    return jsonify({

        "success": True,

        "message": "Complaint opened successfully",

        "complaint": dict(
            updated_complaint
        )

    }), 200


# =========================================================
# UPDATE COMPLAINT STATUS
#
# Allowed:
# Submitted
# Under Review
# In Progress
# Resolved
# =========================================================

@app.route(
    "/api/admin/complaints/<complaint_id>/status",
    methods=["PUT"]
)
def update_complaint_status(complaint_id):

    complaint_id = (
        complaint_id.strip().upper()
    )

    data = request.get_json(
        silent=True
    )

    if not data:

        return jsonify({

            "success": False,

            "message": "No status received"

        }), 400

    new_status = str(
        data.get("status", "")
    ).strip()

    allowed_statuses = [

        "Submitted",

        "Under Review",

        "In Progress",

        "Resolved"

    ]

    if new_status not in allowed_statuses:

        return jsonify({

            "success": False,

            "message": "Invalid status"

        }), 400

    conn = get_db_connection()

    complaint = conn.execute("""
        SELECT complaint_id
        FROM complaints
        WHERE complaint_id = ?

    """, (
        complaint_id,
    )).fetchone()

    if complaint is None:

        conn.close()

        return jsonify({

            "success": False,

            "message": "Complaint ID not found"

        }), 404

    # =====================================================
    # UPDATE STATUS
    # =====================================================

    conn.execute("""
        UPDATE complaints

        SET status = ?

        WHERE complaint_id = ?

    """, (

        new_status,

        complaint_id

    ))

    conn.commit()

    # =====================================================
    # GET UPDATED COMPLAINT
    # =====================================================

    updated_complaint = conn.execute("""
        SELECT
            complaint_id,
            year,
            branch,
            category,
            message,
            status,
            created_at
        FROM complaints
        WHERE complaint_id = ?

    """, (
        complaint_id,
    )).fetchone()

    conn.close()

    return jsonify({

        "success": True,

        "message": "Complaint status updated successfully",

        "complaint": dict(
            updated_complaint
        )

    }), 200


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health_check():

    return jsonify({

        "success": True,

        "message": "Student Complaint Platform Backend Running",

        "database": "connected"

    }), 200


# =========================================================
# ERROR HANDLER
# =========================================================

@app.errorhandler(404)
def page_not_found(error):

    # API 404
    if request.path.startswith("/api/"):

        return jsonify({

            "success": False,

            "message": "API endpoint not found"

        }), 404

    # Any unknown frontend route
    return send_from_directory(
        PROJECT_DIR,
        "index.html"
    )


# =========================================================
# INTERNAL SERVER ERROR
# =========================================================

@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({

        "success": False,

        "message": "Internal server error"

    }), 500


# =========================================================
# INITIALIZE DATABASE
# =========================================================

create_database()


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(

        debug=False,

        host="0.0.0.0",

        port=port

    )
