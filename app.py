from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
from datetime import datetime
import sqlite3
import uuid
import os

# =========================================================

# FLASK APP

# =========================================================

app = Flask(__name__)

CORS(app)

# =========================================================

# PROJECT DIRECTORY

# =========================================================

PROJECT_DIR = Path(__file__).resolve().parent

# =========================================================

# DATABASE LOCATION

# =========================================================

RAILWAY_VOLUME =
os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")

if RAILWAY_VOLUME:
DATABASE_PATH = (
Path(RAILWAY_VOLUME) /
"complaints.db"
)
else:
DATABASE_PATH = (
PROJECT_DIR /
"complaints.db"
)

DATABASE_PATH.parent.mkdir(
parents=True,
exist_ok=True
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

def get_db():


connection = sqlite3.connect(
    str(DATABASE_PATH)
)

connection.row_factory = sqlite3.Row

return connection


# =========================================================

# CREATE / MIGRATE DATABASE

# =========================================================

def create_database():


connection = get_db()

cursor = connection.cursor()


# -----------------------------------------------------
# Create table if it does not exist
# -----------------------------------------------------

cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        complaint_id TEXT UNIQUE NOT NULL,

        roll_no TEXT NOT NULL DEFAULT '',

        year TEXT NOT NULL DEFAULT '',

        branch TEXT NOT NULL DEFAULT '',

        category TEXT NOT NULL DEFAULT '',

        recipient TEXT NOT NULL DEFAULT '',

        message TEXT NOT NULL DEFAULT '',

        status TEXT NOT NULL DEFAULT 'Submitted',

        created_at TEXT NOT NULL DEFAULT ''

    )
""")


connection.commit()


# -----------------------------------------------------
# Check existing columns
# -----------------------------------------------------

cursor.execute(
    "PRAGMA table_info(complaints)"
)


columns = [
    row["name"]
    for row in cursor.fetchall()
]


# -----------------------------------------------------
# Add missing columns
# -----------------------------------------------------

if "roll_no" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN roll_no TEXT
        NOT NULL DEFAULT ''
    """)


if "recipient" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN recipient TEXT
        NOT NULL DEFAULT ''
    """)


if "year" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN year TEXT
        NOT NULL DEFAULT ''
    """)


if "branch" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN branch TEXT
        NOT NULL DEFAULT ''
    """)


if "category" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN category TEXT
        NOT NULL DEFAULT ''
    """)


if "message" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN message TEXT
        NOT NULL DEFAULT ''
    """)


if "status" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN status TEXT
        NOT NULL DEFAULT 'Submitted'
    """)


if "created_at" not in columns:

    cursor.execute("""
        ALTER TABLE complaints
        ADD COLUMN created_at TEXT
        NOT NULL DEFAULT ''
    """)


connection.commit()

connection.close()


# =========================================================

# INITIALIZE DATABASE

# =========================================================

create_database()

# =========================================================

# FRONTEND FILE ROUTES

# =========================================================

@app.route("/")
def home():


return send_from_directory(
    PROJECT_DIR,
    "login.html"
)


@app.route("/index.html")
def index_page():


return send_from_directory(
    PROJECT_DIR,
    "index.html"
)


@app.route("/login.html")
def login_page():


return send_from_directory(
    PROJECT_DIR,
    "login.html"
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


@app.route("/success.html")
def success_page():


return send_from_directory(
    PROJECT_DIR,
    "success.html"
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


# =========================================================

# STATIC FILES

# =========================================================

@app.route("/style.css")
def style_css():


return send_from_directory(
    PROJECT_DIR,
    "style.css"
)


@app.route("/script.js")
def script_js():


return send_from_directory(
    PROJECT_DIR,
    "script.js"
)


@app.route("/admin-dashboard.css")
def admin_dashboard_css():


return send_from_directory(
    PROJECT_DIR,
    "admin-dashboard.css"
)


# =========================================================

# STUDENT LOGIN

# =========================================================

@app.route(
"/api/student/login",
methods=["POST"]
)
def student_login():


data = request.get_json(
    silent=True
) or {}


roll_no = str(
    data.get("roll_no", "")
).strip()


if not roll_no:

    return jsonify({
        "success": False,
        "message":
            "Please enter your Roll Number."
    }), 400


return jsonify({
    "success": True,
    "message":
        "Student login successful.",
    "roll_no":
        roll_no
})


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
) or {}


username = str(
    data.get("username", "")
).strip()


password = str(
    data.get("password", "")
)


if (
    username == ADMIN_USERNAME
    and
    password == ADMIN_PASSWORD
):

    return jsonify({
        "success": True,
        "message":
            "Admin login successful."
    })


return jsonify({
    "success": False,
    "message":
        "Invalid username or password."
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
) or {}


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


# -----------------------------------------------------
# Validation
# -----------------------------------------------------

if not roll_no:

    return jsonify({
        "success": False,
        "message":
            "Roll Number is required."
    }), 400


if not year:

    return jsonify({
        "success": False,
        "message":
            "Year is required."
    }), 400


if not branch:

    return jsonify({
        "success": False,
        "message":
            "Branch is required."
    }), 400


if not category:

    return jsonify({
        "success": False,
        "message":
            "Complaint category is required."
    }), 400


if not recipient:

    return jsonify({
        "success": False,
        "message":
            "Please select who the complaint should be sent to."
    }), 400


allowed_recipients = [
    "Class Teacher",
    "HOD",
    "Principal"
]


if recipient not in allowed_recipients:

    return jsonify({
        "success": False,
        "message":
            "Invalid complaint recipient."
    }), 400


if not message:

    return jsonify({
        "success": False,
        "message":
            "Complaint description is required."
    }), 400


if len(message) > 1000:

    return jsonify({
        "success": False,
        "message":
            "Complaint description cannot exceed 1000 characters."
    }), 400


# -----------------------------------------------------
# Generate complaint ID
# -----------------------------------------------------

complaint_id = (
    "CMP-" +
    uuid.uuid4()
        .hex[:8]
        .upper()
)


created_at =
    datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )


# -----------------------------------------------------
# Save complaint
# -----------------------------------------------------

connection = get_db()


try:

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

        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
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


except sqlite3.IntegrityError:

    connection.close()


    return jsonify({
        "success": False,
        "message":
            "Unable to create complaint ID. Please try again."
    }), 500


finally:

    connection.close()


return jsonify({

    "success": True,

    "message":
        "Complaint submitted successfully.",

    "complaint_id":
        complaint_id

}), 201


# =========================================================

# GET ALL COMPLAINTS

# =========================================================

@app.route(
"/api/complaints",
methods=["GET"]
)
def get_all_complaints():


connection = get_db()


try:

    cursor = connection.execute(
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


    rows = cursor.fetchall()


    complaints = [
        dict(row)
        for row in rows
    ]


finally:

    connection.close()


return jsonify({

    "success": True,

    "complaints":
        complaints

})


# =========================================================

# GET SINGLE COMPLAINT

# =========================================================

@app.route(
"/api/complaints/<complaint_id>",
methods=["GET"]
)
def get_complaint(complaint_id):


complaint_id =
    complaint_id.strip()


connection = get_db()


try:

    cursor = connection.execute(
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

        WHERE complaint_id = ?

        LIMIT 1
        """,

        (complaint_id,)
    )


    row = cursor.fetchone()


finally:

    connection.close()


if row is None:

    return jsonify({

        "success": False,

        "message":
            "Complaint not found."

    }), 404


return jsonify({

    "success": True,

    "complaint":
        dict(row)

})


# =========================================================

# UPDATE COMPLAINT STATUS

# =========================================================

@app.route(
"/api/complaints/<complaint_id>/status",
methods=["PUT"]
)
def update_complaint_status(
complaint_id
):


data = request.get_json(
    silent=True
) or {}


status = str(
    data.get("status", "")
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

        "message":
            "Invalid complaint status."

    }), 400


connection = get_db()


try:

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


    if cursor.rowcount == 0:

        return jsonify({

            "success": False,

            "message":
                "Complaint not found."

        }), 404


finally:

    connection.close()


return jsonify({

    "success": True,

    "message":
        "Complaint status updated successfully.",

    "status":
        status

})


# =========================================================

# HEALTH CHECK

# =========================================================

@app.route(
"/api/health",
methods=["GET"]
)
def health():


return jsonify({

    "success": True,

    "message":
        "VEMU Voice API is running.",

    "database":
        str(DATABASE_PATH)

})


# =========================================================

# 404 HANDLER

# =========================================================

@app.errorhandler(404)
def not_found(error):


return jsonify({

    "success": False,

    "message":
        "Resource not found."

}), 404


# =========================================================

# 500 HANDLER

# =========================================================

@app.errorhandler(500)
def server_error(error):


return jsonify({

    "success": False,

    "message":
        "Internal server error."

}), 500


# =========================================================

# RUN APPLICATION

# =========================================================

if name == "main":


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

