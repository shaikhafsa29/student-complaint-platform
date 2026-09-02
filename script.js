document.addEventListener("DOMContentLoaded", () {

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

        const studentLoginError =
            document.getElementById("studentLoginError");

        const studentLoginBtn =
            document.getElementById("studentLoginBtn");

        studentLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const rollNumber =
                    rollNumberInput.value
                        .trim()
                        .toUpperCase();

                if (!rollNumber) {

                    studentLoginError.textContent =
                        "Please enter your Roll Number.";

                    studentLoginError.classList.remove(
                        "hidden"
                    );

                    return;
                }

                if (studentLoginError) {
                    studentLoginError.classList.add(
                        "hidden"
                    );
                }

                if (studentLoginBtn) {

                    studentLoginBtn.disabled = true;

                    studentLoginBtn.textContent =
                        "Logging in...";
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
                                    roll_no: rollNumber
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
                            "Login failed."
                        );
                    }

                    sessionStorage.setItem(
                        "studentRollNumber",
                        rollNumber
                    );

                    window.location.href =
                        "index.html";

                } catch (error) {

                    studentLoginError.textContent =
                        error.message ||
                        "Login failed. Please try again.";

                    studentLoginError.classList.remove(
                        "hidden"
                    );

                } finally {

                    if (studentLoginBtn) {

                        studentLoginBtn.disabled = false;

                        studentLoginBtn.textContent =
                            "Continue →";
                    }
                }
            }
        );
    }


    /* =========================================================
       PROTECT STUDENT PAGES
    ========================================================= */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    const studentPages = [
        "index.html",
        "contact.html",
        "track.html",
        "success.html",
        "about.html"
    ];

    if (
        studentPages.includes(currentPage) &&
        !sessionStorage.getItem(
            "studentRollNumber"
        )
    ) {

        window.location.href =
            "login.html";

        return;
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
            document.getElementById(
                "complaintSubmitBtn"
            ) ||
            complaintForm.querySelector(
                ".submit-btn"
            );


        /* CHARACTER COUNT */

        if (message && charCount) {

            const updateCharacterCount = () => {

                charCount.textContent =
                    message.value.length;

            };

            updateCharacterCount();

            message.addEventListener(
                "input",
                updateCharacterCount
            );
        }


        /* SUBMIT COMPLAINT */

        complaintForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const rollNumber =
                    sessionStorage.getItem(
                        "studentRollNumber"
                    );


                if (!rollNumber) {

                    window.location.href =
                        "login.html";

                    return;
                }


                const yearElement =
                    document.getElementById("year");

                const branchElement =
                    document.getElementById("branch");

                const categoryElement =
                    document.getElementById("category");

                const recipientElement =
                    document.getElementById("recipient");


                const year =
                    yearElement
                        ? yearElement.value.trim()
                        : "";

                const branch =
                    branchElement
                        ? branchElement.value.trim()
                        : "";

                const category =
                    categoryElement
                        ? categoryElement.value.trim()
                        : "";

                const recipient =
                    recipientElement
                        ? recipientElement.value.trim()
                        : "";

                const complaintMessage =
                    message
                        ? message.value.trim()
                        : "";


                if (
                    !year ||
                    !branch ||
                    !category ||
                    !recipient ||
                    !complaintMessage
                ) {

                    if (complaintError) {

                        complaintError.textContent =
                            "Please fill in all required fields.";

                        complaintError.classList.remove(
                            "hidden"
                        );

                    } else {

                        alert(
                            "Please fill in all required fields."
                        );
                    }

                    return;
                }


                if (complaintError) {

                    complaintError.classList.add(
                        "hidden"
                    );
                }


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
                                        rollNumber,

                                    year:
                                        year,

                                    branch:
                                        branch,

                                    category:
                                        category,

                                    recipient:
                                        recipient,

                                    message:
                                        complaintMessage
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
                        "complaintId",
                        result.complaint_id
                    );

                    sessionStorage.setItem(
                        "lastComplaintId",
                        result.complaint_id
                    );


                    window.location.href =
                        "success.html";


                } catch (error) {

                    if (complaintError) {

                        complaintError.textContent =
                            error.message ||
                            "Something went wrong. Please try again.";

                        complaintError.classList.remove(
                            "hidden"
                        );

                    } else {

                        alert(
                            error.message ||
                            "Something went wrong. Please try again."
                        );
                    }


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
                "lastComplaintId"
            ) ||
            sessionStorage.getItem(
                "complaintId"
            );

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

        const trackingResult =
            document.getElementById(
                "trackingResult"
            );

        const trackingError =
            document.getElementById(
                "trackingError"
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

                    if (trackingError) {

                        trackingError.textContent =
                            "Please enter your Complaint ID.";

                        trackingError.classList.remove(
                            "hidden"
                        );
                    }

                    return;
                }


                if (trackingResult) {

                    trackingResult.classList.add(
                        "hidden"
                    );
                }

                if (trackingError) {

                    trackingError.classList.add(
                        "hidden"
                    );
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/complaints/${encodeURIComponent(
                                complaintId
                            )}`
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


                    if (trackingResult) {

                        trackingResult.classList.remove(
                            "hidden"
                        );
                    }


                } catch (error) {

                    if (trackingError) {

                        trackingError.textContent =
                            error.message ||
                            "Complaint not found.";

                        trackingError.classList.remove(
                            "hidden"
                        );
                    }
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

        const loginButton =
            document.getElementById(
                "adminLoginBtn"
            ) ||
            adminLoginForm.querySelector(
                ".submit-btn"
            );


        adminLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                if (loginError) {

                    loginError.classList.add(
                        "hidden"
                    );
                }


                if (loginButton) {

                    loginButton.disabled = true;

                    loginButton.textContent =
                        "Logging in...";
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

                    if (loginError) {

                        loginError.textContent =
                            error.message ||
                            "Login failed.";

                        loginError.classList.remove(
                            "hidden"
                        );

                    } else {

                        alert(
                            error.message ||
                            "Login failed."
                        );
                    }

                } finally {

                    if (loginButton) {

                        loginButton.disabled = false;

                        loginButton.textContent =
                            "Login to Dashboard →";
                    }
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


        /* -----------------------------------------------------
           ADMIN LOGIN CHECK
        ----------------------------------------------------- */

        if (
            sessionStorage.getItem(
                "adminLoggedIn"
            ) !== "true"
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        /* -----------------------------------------------------
           ELEMENTS
        ----------------------------------------------------- */

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


        let allComplaints = [];

        let currentComplaintId = null;


        /* -----------------------------------------------------
           HELPER: ESCAPE HTML
        ----------------------------------------------------- */

        function escapeHtml(value) {

            return String(value ?? "")
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


        /* -----------------------------------------------------
           HELPER: NORMALIZE STATUS
        ----------------------------------------------------- */

        function normalizeStatus(status) {

            const value =
                String(
                    status || "Submitted"
                )
                    .trim()
                    .toLowerCase()
                    .replace(
                        /_/g,
                        " "
                    );


            if (
                value === "submitted"
            ) {
                return "Submitted";
            }


            if (
                value === "under review" ||
                value === "underreview"
            ) {
                return "Under Review";
            }


            if (
                value === "in progress" ||
                value === "inprogress"
            ) {
                return "In Progress";
            }


            if (
                value === "resolved"
            ) {
                return "Resolved";
            }


            return "Submitted";
        }


        /* -----------------------------------------------------
           HELPER: STATUS CLASS
        ----------------------------------------------------- */

        function getStatusClass(status) {

            const normalized =
                normalizeStatus(status);


            if (
                normalized ===
                "Under Review"
            ) {
                return "status-under-review";
            }


            if (
                normalized ===
                "In Progress"
            ) {
                return "status-in-progress";
            }


            if (
                normalized ===
                "Resolved"
            ) {
                return "status-resolved";
            }


            return "status-submitted";
        }


        /* =====================================================
           LOAD COMPLAINTS
        ===================================================== */

        async function loadComplaints() {

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="8">
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
                    Array.isArray(
                        result.complaints
                    )
                        ? result.complaints
                        : [];


                renderComplaints(
                    allComplaints
                );


                updateStatistics();


            } catch (error) {

                console.error(
                    "Load complaints error:",
                    error
                );


                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8">
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

            complaintsContainer.innerHTML =
                "";


            if (
                !complaints ||
                complaints.length === 0
            ) {

                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8">
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


                    const complaintId =
                        complaint.complaint_id ||
                        "-";


                    const rollNo =
                        complaint.roll_no ||
                        "-";


                    const year =
                        complaint.year ||
                        "-";


                    const branch =
                        complaint.branch ||
                        "-";


                    const category =
                        complaint.category ||
                        "-";


                    const recipient =
                        complaint.recipient ||
                        "Not specified";


                    const status =
                        normalizeStatus(
                            complaint.status
                        );


                    const createdAt =
                        complaint.created_at ||
                        "-";


                    row.innerHTML = `

                        <!-- COMPLAINT ID -->

                        <td class="complaint-id-cell">

                            ${escapeHtml(
                                complaintId
                            )}

                        </td>


                        <!-- ROLL NO -->

                        <td>

                            ${escapeHtml(
                                rollNo
                            )}

                        </td>


                        <!-- CLASS / BRANCH -->

                        <td>

                            <strong>
                                ${escapeHtml(
                                    year
                                )}
                            </strong>

                            <br>

                            <span class="branch-text">
                                ${escapeHtml(
                                    branch
                                )}
                            </span>

                        </td>


                        <!-- CATEGORY -->

                        <td>

                            ${escapeHtml(
                                category
                            )}

                        </td>


                        <!-- SENT TO -->

                        <td>

                            ${escapeHtml(
                                recipient
                            )}

                        </td>


                        <!-- STATUS -->

                        <td>

                            <span
                                class="status-badge ${getStatusClass(
                                    status
                                )}"
                            >

                                ${escapeHtml(
                                    status
                                )}

                            </span>

                        </td>


                        <!-- DATE -->

                        <td>

                            ${escapeHtml(
                                createdAt
                            )}

                        </td>


                        <!-- VIEW -->

                        <td>

                            <button
                                type="button"
                                class="view-btn"
                                data-id="${escapeHtml(
                                    complaintId
                                )}"
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


            attachViewButtons();
        }


        /* =====================================================
           VIEW BUTTONS
        ===================================================== */

        function attachViewButtons() {

            const buttons =
                complaintsContainer.querySelectorAll(
                    ".view-btn"
                );


            buttons.forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const complaintId =
                                button.getAttribute(
                                    "data-id"
                                );


                            if (!complaintId) {

                                alert(
                                    "Complaint ID not found."
                                );

                                return;
                            }


                            openComplaintModal(
                                complaintId
                            );
                        }
                    );
                }
            );
        }


        /* =====================================================
           OPEN COMPLAINT MODAL
        ===================================================== */

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


                currentComplaintId =
                    complaint.complaint_id;


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


                if (modalComplaintId) {

                    modalComplaintId.textContent =
                        complaint.complaint_id ||
                        "-";
                }


                if (modalRollNo) {

                    modalRollNo.textContent =
                        complaint.roll_no ||
                        "-";
                }


                if (modalYear) {

                    modalYear.textContent =
                        complaint.year ||
                        "-";
                }


                if (modalBranch) {

                    modalBranch.textContent =
                        complaint.branch ||
                        "-";
                }


                if (modalCategory) {

                    modalCategory.textContent =
                        complaint.category ||
                        "-";
                }


                if (modalRecipient) {

                    modalRecipient.textContent =
                        complaint.recipient ||
                        "Not specified";
                }


                if (modalDate) {

                    modalDate.textContent =
                        complaint.created_at ||
                        "-";
                }


                const normalizedStatus =
                    normalizeStatus(
                        complaint.status
                    );


                if (modalStatus) {

                    modalStatus.textContent =
                        normalizedStatus;
                }


                if (statusSelect) {

                    statusSelect.value =
                        normalizedStatus;
                }


                if (modalMessage) {

                    modalMessage.textContent =
                        complaint.message ||
                        "-";
                }


                if (complaintModal) {

                    complaintModal.classList.add(
                        "show"
                    );

                    complaintModal.style.display =
                        "flex";
                }


            } catch (error) {

                console.error(
                    "Open complaint error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to load complaint details."
                );
            }
        }


        /* =====================================================
           CLOSE MODAL
        ===================================================== */

        function closeComplaintModal() {

            if (complaintModal) {

                complaintModal.classList.remove(
                    "show"
                );

                complaintModal.style.display =
                    "none";
            }


            currentComplaintId =
                null;
        }


        if (closeModal) {

            closeModal.addEventListener(
                "click",
                closeComplaintModal
            );
        }


        /* CLOSE WHEN CLICKING OUTSIDE MODAL */

        if (complaintModal) {

            complaintModal.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        complaintModal
                    ) {

                        closeComplaintModal();
                    }
                }
            );
        }


        /* CLOSE WITH ESCAPE KEY */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    complaintModal &&
                    complaintModal.classList.contains(
                        "show"
                    )
                ) {

                    closeComplaintModal();
                }
            }
        );


        /* =====================================================
           UPDATE STATUS
        ===================================================== */

        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    if (!currentComplaintId) {

                        alert(
                            "No complaint selected."
                        );

                        return;
                    }


                    const statusSelect =
                        document.getElementById(
                            "statusSelect"
                        );


                    if (!statusSelect) {

                        alert(
                            "Status selector not found."
                        );

                        return;
                    }


                    const status =
                        normalizeStatus(
                            statusSelect.value
                        );


                    const statusUpdateMessage =
                        document.getElementById(
                            "statusUpdateMessage"
                        );


                    updateStatusButton.disabled =
                        true;

                    updateStatusButton.textContent =
                        "Updating...";


                    if (statusUpdateMessage) {

                        statusUpdateMessage.textContent =
                            "";
                    }


                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/complaints/${encodeURIComponent(
                                    currentComplaintId
                                )}/status`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        status:
                                            status
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


                        const modalStatus =
                            document.getElementById(
                                "modalStatus"
                            );


                        if (modalStatus) {

                            modalStatus.textContent =
                                result.status ||
                                status;
                        }


                        if (statusUpdateMessage) {

                            statusUpdateMessage.textContent =
                                "Status updated successfully.";

                            statusUpdateMessage.classList.remove(
                                "error"
                            );
                        }


                        await loadComplaints();


                    } catch (error) {

                        console.error(
                            "Status update error:",
                            error
                        );


                        if (statusUpdateMessage) {

                            statusUpdateMessage.textContent =
                                error.message ||
                                "Failed to update status.";

                            statusUpdateMessage.classList.add(
                                "error"
                            );

                        } else {

                            alert(
                                error.message ||
                                "Failed to update status."
                            );
                        }

                    } finally {

                        updateStatusButton.disabled =
                            false;

                        updateStatusButton.textContent =
                            "✓ Update Status";
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


            const filteredComplaints =
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


                        const complaintStatus =
                            normalizeStatus(
                                complaint.status
                            );


                        const matchesStatus =
                            selectedStatus ===
                                "All" ||
                            complaintStatus ===
                                selectedStatus;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );


            renderComplaints(
                filteredComplaints
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

            const total =
                allComplaints.length;


            const submitted =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) === "Submitted"
                ).length;


            const review =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) === "Under Review"
                ).length;


            const resolved =
                allComplaints.filter(
                    (complaint) =>
                        normalizeStatus(
                            complaint.status
                        ) === "Resolved"
                ).length;


            if (totalComplaints) {

                totalComplaints.textContent =
                    total;
            }


            if (submittedCount) {

                submittedCount.textContent =
                    submitted;
            }


            if (reviewCount) {

                reviewCount.textContent =
                    review;
            }


            if (resolvedCount) {

                resolvedCount.textContent =
                    resolved;
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
