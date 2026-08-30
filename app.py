from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo
import os
from pathlib import Path


# =========================================================
# APP SETUP
# =========================================================

app = Flask(__name__)
CORS(app)

PROJECT_DIR = Path(__file__).resolve().parent
DATABASE = PROJECT_DIR / "complaints.db"


# =========================================================
# ADMIN CREDENTIALS
# =========================================================

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vemu123")


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


# =========================================================
# CREATE DATABASE TABLE
# =========================================================

def init_db():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            roll_no TEXT NOT NULL,
            year TEXT NOT NULL,
            branch TEXT NOT NULL,
            category TEXT NOT NULL,
            recipient TEXT NOT NULL DEFAULT '',
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Submitted',
            created_at TEXT NOT NULL
        )
    """)

    # Add recipient column if the database already exists
    cursor.execute("PRAGMA table_info(complaints)")
    columns = [column["name"] for column in cursor.fetchall()]

    if "recipient" not in columns:
        cursor.execute("""
            ALTER TABLE complaints
            ADD COLUMN recipient TEXT NOT NULL DEFAULT ''
        """)

    connection.commit()
    connection.close()


init_db()


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():
    return send_from_directory(PROJECT_DIR, "index.html")


# =========================================================
# SERVE FRONTEND FILES
# =========================================================

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(PROJECT_DIR, filename)


# =========================================================
# STUDENT LOGIN
# =========================================================

@app.route("/api/student/login", methods=["POST"])
def student_login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No login data received."
        }), 400

    roll_no = data.get("roll_no", "").strip().upper()

    if not roll_no:
        return jsonify({
            "success": False,
            "message": "Please enter your roll number."
        }), 400

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "roll_no": roll_no
    })


# =========================================================
# SUBMIT COMPLAINT
# =========================================================

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No complaint data received."
        }), 400

    roll_no = data.get("roll_no", "").strip().upper()
    year = data.get("year", "").strip()
    branch = data.get("branch", "").strip()
    category = data.get("category", "").strip()
    recipient = data.get("recipient", "").strip()
    message = data.get("message", "").strip()

    if not roll_no or not year or not branch or not category or not message:
        return jsonify({
            "success": False,
            "message": "Please fill in all required fields."
        }), 400

    # Generate unique complaint ID
    complaint_id = "CMP-" + uuid.uuid4().hex[:8].upper()

    # =====================================================
    # INDIA TIME (IST)
    # Railway servers may use UTC, so explicitly use
    # Asia/Kolkata timezone.
    # =====================================================

    created_at = datetime.now(
        ZoneInfo("Asia/Kolkata")
    ).strftime("%Y-%m-%d %H:%M:%S")

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO complaints (
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

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Complaint submitted successfully.",
        "complaint_id": complaint_id
    }), 201


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM complaints
        ORDER BY id DESC
    """)

    complaints = cursor.fetchall()

    connection.close()

    complaints_list = []

    for complaint in complaints:
        complaints_list.append({
            "id": complaint["id"],
            "complaint_id": complaint["complaint_id"],
            "roll_no": complaint["roll_no"],
            "year": complaint["year"],
            "branch": complaint["branch"],
            "category": complaint["category"],
            "recipient": complaint["recipient"],
            "message": complaint["message"],
            "status": complaint["status"],
            "created_at": complaint["created_at"]
        })

    return jsonify({
        "success": True,
        "complaints": complaints_list
    })


# =========================================================
# GET SINGLE COMPLAINT - FOR TRACKING / VIEW BUTTON
# =========================================================

@app.route("/api/complaints/<complaint_id>", methods=["GET"])
def get_single_complaint(complaint_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM complaints
        WHERE complaint_id = ?
    """, (
        complaint_id.strip().upper(),
    ))

    complaint = cursor.fetchone()

    connection.close()

    if not complaint:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "complaint": {
            "id": complaint["id"],
            "complaint_id": complaint["complaint_id"],
            "roll_no": complaint["roll_no"],
            "year": complaint["year"],
            "branch": complaint["branch"],
            "category": complaint["category"],
            "recipient": complaint["recipient"],
            "message": complaint["message"],
            "status": complaint["status"],
            "created_at": complaint["created_at"]
        }
    })


# =========================================================
# UPDATE COMPLAINT STATUS
# =========================================================

@app.route("/api/complaints/<complaint_id>/status", methods=["PUT"])
def update_complaint_status(complaint_id):
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No status data received."
        }), 400

    status = data.get("status", "").strip()

    allowed_statuses = [
        "Submitted",
        "Under Review",
        "In Progress",
        "Resolved"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "success": False,
            "message": "Invalid complaint status."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE complaints
        SET status = ?
        WHERE complaint_id = ?
    """, (
        status,
        complaint_id.strip().upper()
    ))

    connection.commit()

    updated_rows = cursor.rowcount

    connection.close()

    if updated_rows == 0:
        return jsonify({
            "success": False,
            "message": "Complaint not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Complaint status updated successfully."
    })


# =========================================================
# ADMIN LOGIN
# =========================================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No login data received."
        }), 400

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return jsonify({
            "success": True,
            "message": "Login successful."
        })

    return jsonify({
        "success": False,
        "message": "Invalid username or password."
    }), 401


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
