document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   API BASE
========================================================= */

const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_BASE =
    isLocalhost
        ? "http://127.0.0.1:5000"
        : "";



/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function showElement(element) {

    if (element) {
        element.classList.remove("hidden");
    }

}


function hideElement(element) {

    if (element) {
        element.classList.add("hidden");
    }

}


function getStudentRollNumber() {

    return sessionStorage.getItem(
        "studentRollNumber"
    );

}



/* =========================================================
   STUDENT LOGIN
========================================================= */

const studentLoginForm =
    document.getElementById("studentLoginForm");


if (studentLoginForm) {

    const rollInput =
        document.getElementById("studentRollNumber");

    const loginError =
        document.getElementById("studentLoginError");

    const loginButton =
        document.getElementById("studentLoginBtn");


    studentLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const rollNo =
                rollInput.value.trim();


            hideElement(loginError);


            if (!rollNo) {

                loginError.textContent =
                    "Please enter your Roll Number.";

                showElement(loginError);

                return;

            }


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Checking...";

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/student/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                roll_no: rollNo
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.message ||
                        "Login failed."
                    );

                }


                sessionStorage.setItem(
                    "studentRollNumber",
                    rollNo
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Student login error:",
                    error
                );


                loginError.textContent =
                    error.message ||
                    "Unable to connect to server.";


                showElement(loginError);

            } finally {

                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Continue →";

                }

            }

        }
    );

}



/* =========================================================
   STUDENT PAGE PROTECTION
========================================================= */

const protectedPages = [
    "index.html",
    "about.html",
    "contact.html",
    "track.html",
    "success.html"
];


const currentPage =
    window.location.pathname
        .split("/")
        .pop() || "index.html";


if (
    protectedPages.includes(currentPage) &&
    !getStudentRollNumber()
) {

    window.location.href =
        "login.html";

    return;

}



/* =========================================================
   COMPLAINT FORM
========================================================= */

const complaintForm =
    document.getElementById("complaintForm");


if (complaintForm) {


    const messageInput =
        document.getElementById("message");


    const charCount =
        document.getElementById("charCount");


    const recipientInput =
        document.getElementById("recipient");


    const submitButton =
        document.getElementById(
            "complaintSubmitBtn"
        );


    const complaintError =
        document.getElementById(
            "complaintError"
        );


    /* CHARACTER COUNT */

    if (messageInput && charCount) {

        messageInput.addEventListener(
            "input",
            () => {

                charCount.textContent =
                    messageInput.value.length;

            }
        );

    }



    /* FORM SUBMISSION */

    complaintForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            hideElement(complaintError);


            const rollNo =
                getStudentRollNumber();


            if (!rollNo) {

                window.location.href =
                    "login.html";

                return;

            }


            const year =
                document.getElementById(
                    "year"
                ).value;


            const branch =
                document.getElementById(
                    "branch"
                ).value;


            const category =
                document.getElementById(
                    "category"
                ).value;


            const recipient =
                recipientInput
                    ? recipientInput.value
                    : "";


            const message =
                messageInput.value.trim();



            /* VALIDATION */

            if (!year ||
                !branch ||
                !category ||
                !recipient ||
                !message) {

                complaintError.textContent =
                    "Please fill in all required fields.";

                showElement(complaintError);

                return;

            }


            if (message.length > 1000) {

                complaintError.textContent =
                    "Complaint description cannot exceed 1000 characters.";

                showElement(complaintError);

                return;

            }



            /* DISABLE BUTTON */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";

            }



            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/complaints`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                roll_no:
                                    rollNo,

                                year:
                                    year,

                                branch:
                                    branch,

                                category:
                                    category,

                                recipient:
                                    recipient,

                                message:
                                    message

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.message ||
                        "Complaint submission failed."
                    );

                }


                /* SAVE COMPLAINT ID */

                sessionStorage.setItem(
                    "complaintId",
                    data.complaint_id
                );


                /* REDIRECT */

                window.location.href =
                    "success.html";


            } catch (error) {

                console.error(
                    "Complaint submission error:",
                    error
                );


                complaintError.textContent =
                    error.message ||
                    "Unable to submit complaint. Please try again.";


                showElement(complaintError);


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Submit Complaint →";

                }

            }

        }
    );

}



/* =========================================================
   SUCCESS PAGE
========================================================= */

const successComplaintId =
    document.getElementById(
        "successComplaintId"
    );


if (successComplaintId) {

    const complaintId =
        sessionStorage.getItem(
            "complaintId"
        );


    if (complaintId) {

        successComplaintId.textContent =
            complaintId;

    } else {

        successComplaintId.textContent =
            "Not available";

    }

}



/* =========================================================
   TRACK COMPLAINT
========================================================= */

const trackForm =
    document.getElementById(
        "trackForm"
    );


if (trackForm) {


    trackForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const complaintInput =
                document.getElementById(
                    "complaintId"
                );


            const resultBox =
                document.getElementById(
                    "trackingResult"
                );


            const errorBox =
                document.getElementById(
                    "trackingError"
                );


            const complaintId =
                complaintInput.value
                    .trim();


            hideElement(errorBox);


            if (!complaintId) {

                errorBox.textContent =
                    "Please enter your Complaint ID.";

                showElement(errorBox);

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/complaints/${encodeURIComponent(
                            complaintId
                        )}`
                    );


                const data =
                    await response.json();


                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.message ||
                        "Complaint not found."
                    );

                }


                const complaint =
                    data.complaint;


                if (resultBox) {

                    resultBox.innerHTML = `

                        <div class="tracking-card">

                            <h3>
                                Complaint Details
                            </h3>

                            <p>
                                <strong>
                                    Complaint ID:
                                </strong>
                                ${escapeHtml(
                                    complaint.complaint_id
                                )}
                            </p>

                            <p>
                                <strong>
                                    Year:
                                </strong>
                                ${escapeHtml(
                                    complaint.year
                                )}
                            </p>

                            <p>
                                <strong>
                                    Branch:
                                </strong>
                                ${escapeHtml(
                                    complaint.branch
                                )}
                            </p>

                            <p>
                                <strong>
                                    Category:
                                </strong>
                                ${escapeHtml(
                                    complaint.category
                                )}
                            </p>

                            <p>
                                <strong>
                                    Sent To:
                                </strong>
                                ${escapeHtml(
                                    complaint.recipient ||
                                    "Not specified"
                                )}
                            </p>

                            <p>
                                <strong>
                                    Status:
                                </strong>
                                ${escapeHtml(
                                    complaint.status
                                )}
                            </p>

                            <p>
                                <strong>
                                    Submitted:
                                </strong>
                                ${escapeHtml(
                                    complaint.created_at
                                )}
                            </p>

                        </div>

                    `;

                    showElement(resultBox);

                }


            } catch (error) {

                console.error(
                    "Tracking error:",
                    error
                );


                errorBox.textContent =
                    error.message ||
                    "Complaint not found.";

                showElement(errorBox);

            }

        }
    );

}



/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    const adminUsername =
        document.getElementById(
            "adminUsername"
        );


    const adminPassword =
        document.getElementById(
            "adminPassword"
        );


    const adminLoginError =
        document.getElementById(
            "adminLoginError"
        );


    const adminLoginButton =
        document.getElementById(
            "adminLoginBtn"
        );


    adminLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            hideElement(
                adminLoginError
            );


            const username =
                adminUsername.value.trim();


            const password =
                adminPassword.value;


            if (!username ||
                !password) {

                adminLoginError.textContent =
                    "Please enter username and password.";

                showElement(
                    adminLoginError
                );

                return;

            }


            if (adminLoginButton) {

                adminLoginButton.disabled = true;

                adminLoginButton.textContent =
                    "Signing in...";

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/admin/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username:
                                    username,

                                password:
                                    password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.message ||
                        "Invalid admin credentials."
                    );

                }


                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                window.location.href =
                    "admin-dashboard.html";


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                adminLoginError.textContent =
                    error.message ||
                    "Unable to login.";

                showElement(
                    adminLoginError
                );


            } finally {

                if (adminLoginButton) {

                    adminLoginButton.disabled =
                        false;

                    adminLoginButton.textContent =
                        "Login →";

                }

            }

        }
    );

}



/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const complaintsTable =
    document.getElementById(
        "complaintsTableBody"
    );


if (complaintsTable) {

    const isAdminLoggedIn =
        sessionStorage.getItem(
            "adminLoggedIn"
        );


    if (isAdminLoggedIn !== "true") {

        window.location.href =
            "admin-login.html";

        return;

    }


    loadAdminComplaints();

}



async function loadAdminComplaints() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/complaints`
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            throw new Error(
                data.message ||
                "Unable to load complaints."
            );

        }


        renderAdminComplaints(
            data.complaints || []
        );


    } catch (error) {

        console.error(
            "Admin complaints error:",
            error
        );

    }

}



function renderAdminComplaints(
    complaints
) {

    const tableBody =
        document.getElementById(
            "complaintsTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (!complaints.length) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="8"
                    style="text-align:center;">

                    No complaints found.

                </td>

            </tr>

        `;

        return;

    }


    complaints.forEach(
        (complaint) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        complaint.complaint_id
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.roll_no
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.year
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.branch
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.category
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.recipient ||
                        "Not specified"
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        complaint.status
                    )}
                </td>

                <td>
                    <button
                        class="view-btn"
                        data-id="${escapeHtml(
                            complaint.complaint_id
                        )}">
                        View
                    </button>
                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    attachViewButtons();

}



/* =========================================================
   ADMIN VIEW COMPLAINT
========================================================= */

function attachViewButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-btn"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const complaintId =
                        button.dataset.id;

                    openComplaintModal(
                        complaintId
                    );

                }
            );

        }
    );

}



async function openComplaintModal(
    complaintId
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/complaints/${encodeURIComponent(
                    complaintId
                )}`
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            throw new Error(
                data.message ||
                "Unable to load complaint."
            );

        }


        const complaint =
            data.complaint;


        const modal =
            document.getElementById(
                "complaintModal"
            );


        if (!modal) {
            return;
        }


        const modalContent =
            document.getElementById(
                "modalContent"
            );


        if (modalContent) {

            modalContent.innerHTML = `

                <h2>
                    Complaint Details
                </h2>

                <p>
                    <strong>
                        Complaint ID:
                    </strong>
                    ${escapeHtml(
                        complaint.complaint_id
                    )}
                </p>

                <p>
                    <strong>
                        Roll Number:
                    </strong>
                    ${escapeHtml(
                        complaint.roll_no
                    )}
                </p>

                <p>
                    <strong>
                        Year:
                    </strong>
                    ${escapeHtml(
                        complaint.year
                    )}
                </p>

                <p>
                    <strong>
                        Branch:
                    </strong>
                    ${escapeHtml(
                        complaint.branch
                    )}
                </p>

                <p>
                    <strong>
                        Category:
                    </strong>
                    ${escapeHtml(
                        complaint.category
                    )}
                </p>

                <p>
                    <strong>
                        Sent To:
                    </strong>
                    ${escapeHtml(
                        complaint.recipient ||
                        "Not specified"
                    )}
                </p>

                <p>
                    <strong>
                        Complaint:
                    </strong>
                </p>

                <p>
                    ${escapeHtml(
                        complaint.message
                    )}
                </p>

                <p>
                    <strong>
                        Current Status:
                    </strong>
                    ${escapeHtml(
                        complaint.status
                    )}
                </p>

                <div class="status-update">

                    <label for="newStatus">
                        Update Status
                    </label>

                    <select id="newStatus">

                        <option value="Submitted">
                            Submitted
                        </option>

                        <option value="Under Review">
                            Under Review
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                    </select>

                    <button
                        id="updateStatusBtn"
                        class="submit-btn">

                        Update Status

                    </button>

                </div>

            `;


            const statusSelect =
                document.getElementById(
                    "newStatus"
                );


            if (statusSelect) {

                statusSelect.value =
                    complaint.status;

            }


            const updateButton =
                document.getElementById(
                    "updateStatusBtn"
                );


            if (updateButton) {

                updateButton.addEventListener(
                    "click",
                    () => {

                        updateComplaintStatus(
                            complaint.complaint_id
                        );

                    }
                );

            }

        }


        modal.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(
            "Modal error:",
            error
        );

        alert(
            error.message ||
            "Unable to load complaint."
        );

    }

}



/* =========================================================
   UPDATE COMPLAINT STATUS
========================================================= */

async function updateComplaintStatus(
    complaintId
) {

    const statusSelect =
        document.getElementById(
            "newStatus"
        );


    if (!statusSelect) {
        return;
    }


    const status =
        statusSelect.value;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/complaints/${encodeURIComponent(
                    complaintId
                )}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok ||
            !data.success) {

            throw new Error(
                data.message ||
                "Unable to update status."
            );

        }


        alert(
            "Complaint status updated successfully."
        );


        const modal =
            document.getElementById(
                "complaintModal"
            );


        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }


        loadAdminComplaints();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            error.message ||
            "Unable to update complaint status."
        );

    }

}



/* =========================================================
   ADMIN LOGOUT
========================================================= */

const adminLogoutButton =
    document.getElementById(
        "adminLogout"
    );


if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "adminLoggedIn"
            );

            window.location.href =
                "admin-login.html";

        }
    );

}



/* =========================================================
   CLOSE MODAL
========================================================= */

const modalClose =
    document.querySelector(
        ".modal-close"
    );


if (modalClose) {

    modalClose.addEventListener(
        "click",
        () => {

            const modal =
                document.getElementById(
                    "complaintModal"
                );

            if (modal) {

                modal.classList.add(
                    "hidden"
                );

            }

        }
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


});
