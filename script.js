document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   API BASE
========================================================= */

const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_BASE = isLocalhost
    ? "http://127.0.0.1:5000"
    : "";


/* =========================================================
   STUDENT LOGIN
========================================================= */

const studentLoginForm =
    document.getElementById("studentLoginForm");

if (studentLoginForm) {

    const rollNumberInput =
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
                rollNumberInput.value.trim();

            if (!rollNo) {

                loginError.textContent =
                    "Please enter your Roll Number.";

                loginError.classList.remove("hidden");

                return;
            }

            loginError.classList.add("hidden");

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Checking...";
            }

            try {

                const response = await fetch(
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

                const result =
                    await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                        "Student login failed."
                    );
                }

                sessionStorage.setItem(
                    "studentRollNo",
                    rollNo
                );

                window.location.href =
                    "contact.html";

            } catch (error) {

                loginError.textContent =
                    error.message ||
                    "Unable to login.";

                loginError.classList.remove(
                    "hidden"
                );

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
   COMPLAINT SUBMISSION
========================================================= */

const complaintForm =
    document.getElementById("complaintForm");

if (complaintForm) {

    const message =
        document.getElementById("message");

    const charCount =
        document.getElementById("charCount");

    const complaintError =
        document.getElementById("complaintError");

    const submitButton =
        document.getElementById("complaintSubmitBtn");

    const rollNo =
        sessionStorage.getItem("studentRollNo");

    if (!rollNo) {

        window.location.href =
            "login.html";

        return;
    }

    if (message && charCount) {

        const updateCharacterCount = () => {

            charCount.textContent =
                `${message.value.length} / 1000`;
        };

        message.addEventListener(
            "input",
            updateCharacterCount
        );

        updateCharacterCount();
    }


    complaintForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const year =
                document.getElementById("year").value.trim();

            const branch =
                document.getElementById("branch").value.trim();

            const category =
                document.getElementById("category").value.trim();

            const recipient =
                document.getElementById("recipient").value.trim();

            const complaintMessage =
                message.value.trim();

            if (
                !year ||
                !branch ||
                !category ||
                !recipient ||
                !complaintMessage
            ) {

                complaintError.textContent =
                    "Please fill in all required fields.";

                complaintError.classList.remove(
                    "hidden"
                );

                return;
            }

            if (complaintMessage.length > 1000) {

                complaintError.textContent =
                    "Complaint description cannot exceed 1000 characters.";

                complaintError.classList.remove(
                    "hidden"
                );

                return;
            }

            complaintError.classList.add(
                "hidden"
            );

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
                                roll_no: rollNo,
                                year: year,
                                branch: branch,
                                category: category,
                                recipient: recipient,
                                message: complaintMessage
                            })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to submit complaint."
                    );
                }

                sessionStorage.setItem(
                    "lastComplaintId",
                    result.complaint_id
                );

                sessionStorage.setItem(
                    "complaintId",
                    result.complaint_id
                );

                window.location.href =
                    "success.html";

            } catch (error) {

                complaintError.textContent =
                    error.message ||
                    "Something went wrong. Please try again.";

                complaintError.classList.remove(
                    "hidden"
                );

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
    document.getElementById("successComplaintId");

if (successComplaintId) {

    const complaintId =
        sessionStorage.getItem("lastComplaintId") ||
        sessionStorage.getItem("complaintId");

    if (complaintId) {

        successComplaintId.textContent =
            complaintId;
    }
}


/* =========================================================
   COMPLAINT TRACKING
========================================================= */

const trackForm =
    document.getElementById("trackForm");

if (trackForm) {

    const complaintIdInput =
        document.getElementById(
            "trackComplaintId"
        );

    const trackingError =
        document.getElementById(
            "trackingError"
        );

    const trackingResult =
        document.getElementById(
            "trackingResult"
        );

    const resultComplaintId =
        document.getElementById(
            "resultComplaintId"
        );

    const resultCategory =
        document.getElementById(
            "resultCategory"
        );

    const resultStatus =
        document.getElementById(
            "resultStatus"
        );

    const resultDate =
        document.getElementById(
            "resultDate"
        );

    trackForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const complaintId =
                complaintIdInput.value
                    .trim()
                    .toUpperCase();

            if (!complaintId) {

                trackingError.textContent =
                    "Please enter your Complaint ID.";

                trackingError.classList.remove(
                    "hidden"
                );

                return;
            }

            trackingError.classList.add(
                "hidden"
            );

            trackingResult.classList.add(
                "hidden"
            );

            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Complaint not found."
                    );
                }

                const complaint =
                    result.complaint;

                if (resultComplaintId) {
                    resultComplaintId.textContent =
                        complaint.complaint_id;
                }

                if (resultCategory) {
                    resultCategory.textContent =
                        complaint.category;
                }

                if (resultStatus) {
                    resultStatus.textContent =
                        complaint.status;
                }

                if (resultDate) {
                    resultDate.textContent =
                        complaint.created_at;
                }

                trackingResult.classList.remove(
                    "hidden"
                );

            } catch (error) {

                trackingError.textContent =
                    error.message ||
                    "Unable to find complaint.";

                trackingError.classList.remove(
                    "hidden"
                );
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

    const loginError =
        document.getElementById(
            "loginError"
        );

    adminLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            loginError.classList.add(
                "hidden"
            );

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
                                    adminUsername.value.trim(),
                                password:
                                    adminPassword.value
                            })
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Invalid username or password."
                    );
                }

                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );

                window.location.href =
                    "admin-dashboard.html";

            } catch (error) {

                loginError.textContent =
                    error.message ||
                    "Login failed.";

                loginError.classList.remove(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const complaintsContainer =
    document.getElementById(
        "complaintsContainer"
    );

if (complaintsContainer) {

    if (
        sessionStorage.getItem(
            "adminLoggedIn"
        ) !== "true"
    ) {

        window.location.href =
            "admin-login.html";

        return;
    }


    const totalComplaints =
        document.getElementById(
            "totalComplaints"
        );

    const submittedCount =
        document.getElementById(
            "submittedCount"
        );

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );

    const resolvedCount =
        document.getElementById(
            "resolvedCount"
        );

    const refreshButton =
        document.getElementById(
            "refreshComplaints"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const complaintModal =
        document.getElementById(
            "complaintModal"
        );

    const closeModal =
        document.getElementById(
            "closeModal"
        );

    const updateStatusButton =
        document.getElementById(
            "updateStatusButton"
        );

    const searchComplaint =
        document.getElementById(
            "searchComplaint"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const modalComplaintId =
        document.getElementById(
            "modalComplaintId"
        );

    const modalRollNo =
        document.getElementById(
            "modalRollNo"
        );

    const modalYear =
        document.getElementById(
            "modalYear"
        );

    const modalBranch =
        document.getElementById(
            "modalBranch"
        );

    const modalCategory =
        document.getElementById(
            "modalCategory"
        );

    const modalRecipient =
        document.getElementById(
            "modalRecipient"
        );

    const modalDate =
        document.getElementById(
            "modalDate"
        );

    const modalStatus =
        document.getElementById(
            "modalStatus"
        );

    const statusSelect =
        document.getElementById(
            "statusSelect"
        );

    const modalMessage =
        document.getElementById(
            "modalMessage"
        );

    const statusUpdateMessage =
        document.getElementById(
            "statusUpdateMessage"
        );


    let allComplaints = [];
    let currentComplaintId = null;


    /* =====================================================
       LOAD COMPLAINTS
    ===================================================== */

    async function loadComplaints() {

        complaintsContainer.innerHTML = `
            <tr>
                <td colspan="7">
                    Loading complaints...
                </td>
            </tr>
        `;

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/complaints`
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Failed to load complaints."
                );
            }

            allComplaints =
                Array.isArray(result.complaints)
                    ? result.complaints
                    : [];

            renderComplaints(
                allComplaints
            );

            updateStatistics();

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="7">
                        Unable to load complaints.
                    </td>
                </tr>
            `;
        }
    }


    /* =====================================================
       RENDER COMPLAINTS
    ===================================================== */

    function renderComplaints(
        complaints
    ) {

        complaintsContainer.innerHTML = "";

        if (!complaints.length) {

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="7">
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
                            complaint.year
                        )}
                        /
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
                            complaint.status
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            complaint.created_at
                        )}
                    </td>

                    <td>
                        <button
                            class="view-btn"
                            data-id="${escapeHtml(
                                complaint.complaint_id
                            )}"
                            type="button"
                        >
                            View
                        </button>
                    </td>
                `;

                complaintsContainer.appendChild(
                    row
                );
            }
        );


        document
            .querySelectorAll(
                ".view-btn"
            )
            .forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            openComplaintModal(
                                button.dataset.id
                            );
                        }
                    );
                }
            );
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
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


    /* =====================================================
       OPEN COMPLAINT MODAL
    ===================================================== */

    async function openComplaintModal(
        complaintId
    ) {

        currentComplaintId =
            complaintId;

        if (statusUpdateMessage) {
            statusUpdateMessage.textContent =
                "";
            statusUpdateMessage.className =
                "status-update-message";
        }

        try {

            const response =
                await fetch(
                    `${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to load complaint."
                );
            }

            const complaint =
                result.complaint;


            if (modalComplaintId) {
                modalComplaintId.textContent =
                    complaint.complaint_id;
            }

            if (modalRollNo) {
                modalRollNo.textContent =
                    complaint.roll_no || "-";
            }

            if (modalYear) {
                modalYear.textContent =
                    complaint.year || "-";
            }

            if (modalBranch) {
                modalBranch.textContent =
                    complaint.branch || "-";
            }

            if (modalCategory) {
                modalCategory.textContent =
                    complaint.category || "-";
            }

            if (modalRecipient) {
                modalRecipient.textContent =
                    complaint.recipient || "-";
            }

            if (modalDate) {
                modalDate.textContent =
                    complaint.created_at || "-";
            }

            if (modalStatus) {
                modalStatus.textContent =
                    complaint.status || "Submitted";
            }

            if (modalMessage) {
                modalMessage.textContent =
                    complaint.message || "";
            }


            /* =============================================
               IMPORTANT:
               Set dropdown to EXACT backend value
            ============================================= */

            if (statusSelect) {

                const currentStatus =
                    normalizeStatus(
                        complaint.status
                    );

                statusSelect.value =
                    currentStatus;

                if (
                    statusSelect.value !==
                    currentStatus
                ) {

                    statusSelect.value =
                        "Submitted";
                }
            }


            if (complaintModal) {
                complaintModal.classList.add(
                    "active"
                );

                complaintModal.classList.remove(
                    "hidden"
                );
            }

        } catch (error) {

            console.error(
                "Open complaint error:",
                error
            );

            alert(
                error.message ||
                "Unable to open complaint."
            );
        }
    }


    /* =====================================================
       NORMALIZE STATUS
    ===================================================== */

    function normalizeStatus(
        status
    ) {

        const value =
            String(
                status || ""
            )
                .trim()
                .toLowerCase();

        if (value === "submitted") {
            return "Submitted";
        }

        if (
            value === "under review" ||
            value === "under_review" ||
            value === "underreview"
        ) {
            return "Under Review";
        }

        if (
            value === "in progress" ||
            value === "in_progress" ||
            value === "inprogress"
        ) {
            return "In Progress";
        }

        if (value === "resolved") {
            return "Resolved";
        }

        return "Submitted";
    }


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    if (updateStatusButton) {

        updateStatusButton.addEventListener(
            "click",
            async () => {

                if (!currentComplaintId) {

                    alert(
                        "Please open a complaint first."
                    );

                    return;
                }

                if (!statusSelect) {

                    alert(
                        "Status selector not found."
                    );

                    return;
                }


                /*
                 * ALWAYS use the select VALUE.
                 * These values exactly match app.py.
                 */

                const status =
                    normalizeStatus(
                        statusSelect.value
                    );


                if (statusUpdateMessage) {

                    statusUpdateMessage.textContent =
                        "Updating status...";

                    statusUpdateMessage.className =
                        "status-update-message";
                }

                updateStatusButton.disabled =
                    true;


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/complaints/${encodeURIComponent(currentComplaintId)}/status`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        status: status
                                    })
                            }
                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            "Failed to update status."
                        );
                    }


                    /* =====================================
                       UPDATE MODAL
                    ===================================== */

                    if (modalStatus) {

                        modalStatus.textContent =
                            status;
                    }


                    if (statusUpdateMessage) {

                        statusUpdateMessage.textContent =
                            "Status updated successfully.";

                        statusUpdateMessage.className =
                            "status-update-message success";
                    }


                    /* =====================================
                       REFRESH DASHBOARD
                    ===================================== */

                    await loadComplaints();


                    /*
                     * Keep modal open and preserve
                     * currently selected status.
                     */

                    if (statusSelect) {
                        statusSelect.value =
                            status;
                    }


                } catch (error) {

                    console.error(
                        "Status update error:",
                        error
                    );

                    if (statusUpdateMessage) {

                        statusUpdateMessage.textContent =
                            error.message ||
                            "Unable to update status.";

                        statusUpdateMessage.className =
                            "status-update-message error";
                    }

                } finally {

                    updateStatusButton.disabled =
                        false;
                }
            }
        );
    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            () => {

                if (complaintModal) {

                    complaintModal.classList.remove(
                        "active"
                    );

                    complaintModal.classList.add(
                        "hidden"
                    );
                }

                currentComplaintId =
                    null;
            }
        );
    }


    if (complaintModal) {

        complaintModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    complaintModal
                ) {

                    complaintModal.classList.remove(
                        "active"
                    );

                    complaintModal.classList.add(
                        "hidden"
                    );

                    currentComplaintId =
                        null;
                }
            }
        );
    }


    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    function applyFilters() {

        const searchValue =
            searchComplaint
                ? searchComplaint.value
                    .trim()
                    .toUpperCase()
                : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "All";


        const filtered =
            allComplaints.filter(
                (complaint) => {

                    const complaintId =
                        String(
                            complaint.complaint_id ||
                            ""
                        ).toUpperCase();

                    const matchesSearch =
                        complaintId.includes(
                            searchValue
                        );

                    const matchesStatus =
                        selectedStatus === "All" ||
                        normalizeStatus(
                            complaint.status
                        ) ===
                        selectedStatus;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        renderComplaints(
            filtered
        );
    }


    if (searchComplaint) {

        searchComplaint.addEventListener(
            "input",
            applyFilters
        );
    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        if (totalComplaints) {

            totalComplaints.textContent =
                allComplaints.length;
        }


        if (submittedCount) {

            submittedCount.textContent =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) ===
                        "Submitted"
                ).length;
        }


        if (reviewCount) {

            reviewCount.textContent =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) ===
                        "Under Review"
                ).length;
        }


        if (resolvedCount) {

            resolvedCount.textContent =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) ===
                        "Resolved"
                ).length;
        }
    }


    /* =====================================================
       REFRESH
    ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadComplaints
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
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


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadComplaints();
}


});
