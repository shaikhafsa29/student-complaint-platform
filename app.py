from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE = "complaints.db"


# =========================================================
# ADMIN CREDENTIALS
# =========================================================

import os

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vemu123")


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# CREATE DATABASE
# =========================================================

def create_database():

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
# ADMIN LOGIN
# =========================================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "No login data received"
        }), 400


    username = data.get("username", "").strip()

    password = data.get("password", "")


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
# SUBMIT COMPLAINT
# =========================================================

@app.route("/api/complaints", methods=["POST"])
def submit_complaint():

    data = request.get_json()


    if not data:

        return jsonify({
            "success": False,
            "message": "No data received"
        }), 400


    year = data.get("year", "").strip()

    branch = data.get("branch", "").strip()

    category = data.get("category", "").strip()

    message = data.get("message", "").strip()


    if not year or not branch or not category or not message:

        return jsonify({
            "success": False,
            "message": "Please fill in all required fields"
        }), 400


    # Generate unique complaint ID

    complaint_id = (
        f"CMP-{uuid.uuid4().hex[:8].upper()}"
    )


    # Current date and time

    created_at = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


    conn = get_db_connection()


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
    conn.close()


    return jsonify({

        "success": True,

        "message": "Complaint submitted successfully",

        "complaint_id": complaint_id,

        "status": "Submitted"

    }), 201


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.route("/api/complaints", methods=["GET"])
def get_complaints():

    conn = get_db_connection()


    complaints = conn.execute("""
        SELECT *
        FROM complaints
        ORDER BY id DESC
    """).fetchall()


    conn.close()


    complaint_list = []


    for complaint in complaints:

        complaint_list.append(
            dict(complaint)
        )


    return jsonify(complaint_list)


# =========================================================
# TRACK COMPLAINT
# =========================================================

@app.route("/api/complaints/<complaint_id>", methods=["GET"])
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
    """, (complaint_id,)).fetchone()


    conn.close()


    # Complaint not found

    if complaint is None:

        return jsonify({

            "success": False,

            "message": "Complaint ID not found"

        }), 404


    # Complaint found

    return jsonify({

        "success": True,

        "complaint": dict(complaint)

    }), 200


# =========================================================
# ADMIN VIEW COMPLAINT
#
# IMPORTANT:
# When admin clicks VIEW,
# Submitted automatically becomes Under Review.
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


    # Check whether complaint exists

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
    """, (complaint_id,)).fetchone()


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


    # Get updated complaint

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
    """, (complaint_id,)).fetchone()


    conn.close()


    return jsonify({

        "success": True,

        "message": "Complaint opened successfully",

        "complaint": dict(updated_complaint)

    }), 200


# =========================================================
# UPDATE COMPLAINT STATUS
#
# This will be used later for:
#
# Submitted
# Under Review
# In Progress
# Resolved
#
# =========================================================

@app.route(
    "/api/admin/complaints/<complaint_id>/status",
    methods=["PUT"]
)
def update_complaint_status(complaint_id):

    complaint_id = (
        complaint_id.strip().upper()
    )


    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "message": "No status received"

        }), 400


    new_status = data.get(
        "status",
        ""
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
    """, (complaint_id,)).fetchone()


    if complaint is None:

        conn.close()

        return jsonify({

            "success": False,

            "message": "Complaint ID not found"

        }), 404


    conn.execute("""
        UPDATE complaints

        SET status = ?

        WHERE complaint_id = ?
    """, (

        new_status,

        complaint_id

    ))


    conn.commit()


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
    """, (complaint_id,)).fetchone()


    conn.close()


    return jsonify({

        "success": True,

        "message": "Complaint status updated successfully",

        "complaint": dict(updated_complaint)

    }), 200


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":
    create_database()

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )