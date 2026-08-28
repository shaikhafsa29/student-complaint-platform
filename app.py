from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import uuid
from datetime import datetime
import os
from pathlib import Path

# =========================================================

# APP SETUP

# =========================================================

app = Flask(**name**)
CORS(app)

PROJECT_DIR = Path(**file**).resolve().parent
DATABASE = PROJECT_DIR / "complaints.db"

# =========================================================

# ADMIN CREDENTIALS

# =========================================================

ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "vemu123")

# =========================================================

# DATABASE

# =========================================================

def get_db_connection():


connection = sqlite3.connect(DATABASE)

connection.row_factory = sqlite3.Row

return connection


def init_db():


connection = get_db_connection()

cursor = connection.cursor()

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_id TEXT UNIQUE NOT NULL,
        year TEXT NOT NULL,
        branch TEXT NOT NULL,
        category TEXT NOT NULL,
        recipient TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Submitted',
        created_at TEXT NOT NULL
    )
    """
)

connection.commit()

connection.close()


init_db()

# =========================================================

# HOME PAGE

# =========================================================

@app.route("/")
def home():


return send_from_directory(
    PROJECT_DIR,
    "index.html"
)


# =========================================================

# SERVE FRONTEND FILES

# =========================================================

@app.route("/[path:filename](path:filename)")
def frontend_files(filename):


return send_from_directory(
    PROJECT_DIR,
    filename
)


# =========================================================

# SUBMIT COMPLAINT

# =========================================================

@app.route(
"/api/complaints",
methods=["POST"]
)
def submit_complaint():


data = request.get_json()

if not data:

    return jsonify({
        "success": False,
        "message": "No complaint data received."
    }), 400


year = data.get(
    "year",
    ""
).strip()

branch = data.get(
    "branch",
    ""
).strip()

category = data.get(
    "category",
    ""
).strip()

recipient = data.get(
    "recipient",
    ""
).strip()

message = data.get(
    "message",
    ""
).strip()


if (
    not year or
    not branch or
    not category or
    not recipient or
    not message
):

    return jsonify({
        "success": False,
        "message": "Please fill in all required fields."
    }), 400


complaint_id = (
    "CMP-" +
    uuid.uuid4()
    .hex[:8]
    .upper()
)


created_at = datetime.now().strftime(
    "%Y-%m-%d %H:%M:%S"
)


connection = get_db_connection()

cursor = connection.cursor()


cursor.execute(
    """
    INSERT INTO complaints (
        complaint_id,
        year,
        branch,
        category,
        recipient,
        message,
        status,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
    (
        complaint_id,
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


# =========================================================

# GET ALL COMPLAINTS

# =========================================================

@app.route(
"/api/complaints",
methods=["GET"]
)
def get_complaints():


connection = get_db_connection()

cursor = connection.cursor()


cursor.execute(
    """
    SELECT *
    FROM complaints
    ORDER BY id DESC
    """
)


complaints = cursor.fetchall()

connection.close()


complaints_list = []


for complaint in complaints:

    complaints_list.append({

        "id":
            complaint["id"],

        "complaint_id":
            complaint["complaint_id"],

        "year":
            complaint["year"],

        "branch":
            complaint["branch"],

        "category":
            complaint["category"],

        "recipient":
            complaint["recipient"],

        "message":
            complaint["message"],

        "status":
            complaint["status"],

        "created_at":
            complaint["created_at"]

    })


return jsonify(
    complaints_list
)


# =========================================================

# TRACK SINGLE COMPLAINT

# =========================================================

@app.route(
"/api/complaints/<complaint_id>",
methods=["GET"]
)
def get_single_complaint(complaint_id):


complaint_id = complaint_id.strip().upper()


connection = get_db_connection()

cursor = connection.cursor()


cursor.execute(
    """
    SELECT *
    FROM complaints
    WHERE complaint_id = ?
    """,
    (
        complaint_id,
    )
)


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

        "id":
            complaint["id"],

        "complaint_id":
            complaint["complaint_id"],

        "year":
            complaint["year"],

        "branch":
            complaint["branch"],

        "category":
            complaint["category"],

        "recipient":
            complaint["recipient"],

        "message":
            complaint["message"],

        "status":
            complaint["status"],

        "created_at":
            complaint["created_at"]

    }

})


# =========================================================

# ADMIN VIEW COMPLAINT

# =========================================================

@app.route(
"/api/admin/complaints/<complaint_id>/view",
methods=["POST"]
)
def admin_view_complaint(complaint_id):


complaint_id = complaint_id.strip().upper()


connection = get_db_connection()

cursor = connection.cursor()


cursor.execute(
    """
    SELECT *
    FROM complaints
    WHERE complaint_id = ?
    """,
    (
        complaint_id,
    )
)


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

        "id":
            complaint["id"],

        "complaint_id":
            complaint["complaint_id"],

        "year":
            complaint["year"],

        "branch":
            complaint["branch"],

        "category":
            complaint["category"],

        "recipient":
            complaint["recipient"],

        "message":
            complaint["message"],

        "status":
            complaint["status"],

        "created_at":
            complaint["created_at"]

    }

})

# =========================================================

# UPDATE COMPLAINT STATUS

# =========================================================

@app.route(
"/api/admin/complaints/<complaint_id>/status",
methods=["PUT"]
)
def update_complaint_status(complaint_id):


data = request.get_json()


if not data:

    return jsonify({
        "success": False,
        "message": "No status data received."
    }), 400


status = data.get(
    "status",
    ""
).strip()


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


complaint_id = complaint_id.strip().upper()


connection = get_db_connection()

cursor = connection.cursor()


cursor.execute(
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


updated_rows = cursor.rowcount


cursor.execute(
    """
    SELECT *
    FROM complaints
    WHERE complaint_id = ?
    """,
    (
        complaint_id,
    )
)


complaint = cursor.fetchone()


connection.close()


if updated_rows == 0 or not complaint:

    return jsonify({
        "success": False,
        "message": "Complaint not found."
    }), 404


return jsonify({

    "success": True,

    "message":
        "Complaint status updated successfully.",

    "complaint": {

        "id":
            complaint["id"],

        "complaint_id":
            complaint["complaint_id"],

        "year":
            complaint["year"],

        "branch":
            complaint["branch"],

        "category":
            complaint["category"],

        "recipient":
            complaint["recipient"],

        "message":
            complaint["message"],

        "status":
            complaint["status"],

        "created_at":
            complaint["created_at"]

    }

})


# =========================================================

# ADMIN LOGIN

# =========================================================

@app.route(
"/api/admin/login",
methods=["POST"]
)
def admin_login():


data = request.get_json()


if not data:

    return jsonify({
        "success": False,
        "message": "No login data received."
    }), 400


username = data.get(
    "username",
    ""
).strip()


password = data.get(
    "password",
    ""
).strip()


if (
    username == ADMIN_USERNAME
    and
    password == ADMIN_PASSWORD
):

    return jsonify({

        "success": True,

        "message":
            "Login successful."

    })


return jsonify({

    "success": False,

    "message":
        "Invalid username or password."

}), 401


# =========================================================

# RUN APPLICATION

# =========================================================

if **name** == "**main**":


port = int(
    os.environ.get(
        "PORT",
        5000
    )
)


app.run(

    host="0.0.0.0",

    port=port,

    debug=False

)

