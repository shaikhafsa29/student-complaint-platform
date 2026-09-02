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
       HELPER FUNCTIONS
    ========================================================= */

    function getPageName() {
        return window.location.pathname.split("/").pop().toLowerCase();
    }

    function getStudentRollNumber() {
        return sessionStorage.getItem("studentRollNumber");
    }

    function isStudentLoggedIn() {
        const rollNo = getStudentRollNumber();
        return rollNo && rollNo.trim() !== "";
    }

    function isAdminLoggedIn() {
        return sessionStorage.getItem("adminLoggedIn") === "true";
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showElement(element, displayValue = "") {
        if (element) {
            element.style.display = displayValue;
        }
    }

    function hideElement(element) {
        if (element) {
            element.style.display = "none";
        }
    }


    /* =========================================================
       STUDENT LOGIN PAGE
    ========================================================= */

    const studentLoginForm = document.getElementById("studentLoginForm");

    if (studentLoginForm) {

        /* If already logged in, DO NOT show login card again */
        if (isStudentLoggedIn()) {
            window.location.replace("contact.html");
            return;
        }

        studentLoginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const rollInput =
                document.getElementById("studentRollNumber");

            const errorBox =
                document.getElementById("studentLoginError");

            const loginButton =
                document.getElementById("studentLoginBtn");

            const rollNo =
                rollInput ? rollInput.value.trim() : "";

            if (errorBox) {
                errorBox.textContent = "";
            }

            if (!rollNo) {

                if (errorBox) {
                    errorBox.textContent =
                        "Please enter your Roll Number.";
                }

                return;
            }

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
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            roll_no: rollNo
                        })
                    }
                );

                let data = {};

                try {
                    data = await response.json();
                } catch (jsonError) {
                    data = {};
                }

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to continue. Please check your Roll Number."
                    );
                }

                /* SAVE LOGIN */
                sessionStorage.setItem(
                    "studentRollNumber",
                    rollNo
                );

                /*
                   IMPORTANT:
                   After successful login go directly to
                   Submit Complaint page.
                */
                window.location.replace("contact.html");

            } catch (error) {

                console.error("Student login error:", error);

                if (errorBox) {
                    errorBox.textContent =
                        error.message ||
                        "Something went wrong. Please try again.";
                }

                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Continue";
                }
            }
        });
    }


    /* =========================================================
       PROTECT STUDENT PAGES
    ========================================================= */

    const currentPage = getPageName();

    const protectedStudentPages = [
        "index.html",
        "contact.html",
        "track.html",
        "success.html",
        "about.html"
    ];

    if (
        protectedStudentPages.includes(currentPage) &&
        !isStudentLoggedIn()
    ) {

        window.location.replace("login.html");
        return;
    }


    /* =========================================================
       SUBMIT COMPLAINT PAGE
    ========================================================= */

    const complaintForm =
        document.getElementById("complaintForm");

    if (complaintForm) {

        const messageInput =
            document.getElementById("message");

        const charCount =
            document.getElementById("charCount");

        const errorBox =
            document.getElementById("complaintError");

        const submitButton =
            document.getElementById("complaintSubmitBtn");


        /* Character counter */

        if (messageInput && charCount) {

            const updateCharacterCount = () => {

                const length =
                    messageInput.value.length;

                charCount.textContent =
                    `${length}/1000`;

                if (length >= 1000) {
                    charCount.classList.add("limit");
                } else {
                    charCount.classList.remove("limit");
                }
            };

            messageInput.addEventListener(
                "input",
                updateCharacterCount
            );

            updateCharacterCount();
        }


        /* Complaint submission */

        complaintForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (errorBox) {
                    errorBox.textContent = "";
                }

                const rollNo =
                    getStudentRollNumber();

                if (!rollNo) {

                    window.location.replace(
                        "login.html"
                    );

                    return;
                }

                const year =
                    document.getElementById("year")?.value.trim();

                const branch =
                    document.getElementById("branch")?.value.trim();

                const category =
                    document.getElementById("category")?.value.trim();

                const recipient =
                    document.getElementById("recipient")?.value.trim();

                const message =
                    document.getElementById("message")?.value.trim();


                /* Validation */

                if (!year) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please select your year.";
                    }

                    return;
                }

                if (!branch) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please enter your classroom / branch.";
                    }

                    return;
                }

                if (!category) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please select a complaint category.";
                    }

                    return;
                }

                if (!recipient) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please select who you want to send the complaint to.";
                    }

                    return;
                }

                if (!message) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please enter your complaint.";
                    }

                    return;
                }

                if (message.length > 1000) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Complaint cannot exceed 1000 characters.";
                    }

                    return;
                }


                /* Disable button */

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent =
                        "Submitting...";
                }


                try {

                    const response = await fetch(
                        `${API_BASE}/api/complaints`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({

                                roll_no: rollNo,

                                year: year,

                                branch: branch,

                                category: category,

                                recipient: recipient,

                                message: message

                            })
                        }
                    );


                    let data = {};

                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        data = {};
                    }


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Failed to submit complaint."
                        );
                    }


                    /* Get Complaint ID */

                    const complaintId =
                        data.complaint_id ||
                        data.complaintId ||
                        data.id;


                    if (!complaintId) {

                        throw new Error(
                            "Complaint submitted, but Complaint ID was not received."
                        );
                    }


                    /* Save Complaint ID */

                    sessionStorage.setItem(
                        "complaintId",
                        complaintId
                    );

                    sessionStorage.setItem(
                        "lastComplaintId",
                        complaintId
                    );


                    /* Redirect */

                    window.location.replace(
                        "success.html"
                    );

                } catch (error) {

                    console.error(
                        "Complaint submission error:",
                        error
                    );

                    if (errorBox) {
                        errorBox.textContent =
                            error.message ||
                            "Unable to submit complaint. Please try again.";
                    }

                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent =
                            "Submit Complaint";
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
       TRACK COMPLAINT PAGE
    ========================================================= */

    const trackForm =
        document.getElementById("trackForm");

    if (trackForm) {

        const trackInput =
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


        trackForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (trackingError) {
                    trackingError.textContent = "";
                }

                if (trackingResult) {
                    trackingResult.style.display =
                        "none";
                }


                const complaintId =
                    trackInput
                        ? trackInput.value.trim()
                        : "";


                if (!complaintId) {

                    if (trackingError) {
                        trackingError.textContent =
                            "Please enter your Complaint ID.";
                    }

                    return;
                }


                try {

                    const response = await fetch(
                        `${API_BASE}/api/complaints/${encodeURIComponent(
                            complaintId
                        )}`
                    );


                    let data = {};

                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        data = {};
                    }


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Complaint not found."
                        );
                    }


                    /* Support both direct object and data object */

                    const complaint =
                        data.complaint ||
                        data.data ||
                        data;


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
                            complaint.complaint_id ||
                            complaint.id ||
                            complaintId;
                    }


                    if (resultCategory) {

                        resultCategory.textContent =
                            complaint.category ||
                            "—";
                    }


                    if (resultStatus) {

                        resultStatus.textContent =
                            complaint.status ||
                            "Submitted";

                        resultStatus.className =
                            `status-badge ${getStatusClass(
                                complaint.status
                            )}`;
                    }


                    if (resultDate) {

                        resultDate.textContent =
                            formatDate(
                                complaint.created_at
                            );
                    }


                    if (trackingResult) {
                        trackingResult.style.display =
                            "block";
                    }

                } catch (error) {

                    console.error(
                        "Tracking error:",
                        error
                    );

                    if (trackingError) {
                        trackingError.textContent =
                            error.message ||
                            "Complaint not found.";
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

        if (isAdminLoggedIn()) {

            /*
               If admin is already logged in and opens
               admin-login.html, send them to dashboard.
            */

            window.location.replace(
                "admin-dashboard.html"
            );

            return;
        }


        adminLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const usernameInput =
                    document.getElementById(
                        "adminUsername"
                    );

                const passwordInput =
                    document.getElementById(
                        "adminPassword"
                    );

                const errorBox =
                    document.getElementById(
                        "loginError"
                    );

                const loginButton =
                    document.getElementById(
                        "adminLoginBtn"
                    );


                const username =
                    usernameInput
                        ? usernameInput.value.trim()
                        : "";

                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (errorBox) {
                    errorBox.textContent = "";
                }


                if (!username || !password) {

                    if (errorBox) {
                        errorBox.textContent =
                            "Please enter username and password.";
                    }

                    return;
                }


                if (loginButton) {
                    loginButton.disabled = true;
                    loginButton.textContent =
                        "Signing in...";
                }


                try {

                    const response = await fetch(
                        `${API_BASE}/api/admin/login`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({

                                username: username,

                                password: password

                            })
                        }
                    );


                    let data = {};

                    try {
                        data = await response.json();
                    } catch (jsonError) {
                        data = {};
                    }


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            data.error ||
                            "Invalid username or password."
                        );
                    }


                    sessionStorage.setItem(
                        "adminLoggedIn",
                        "true"
                    );


                    window.location.replace(
                        "admin-dashboard.html"
                    );

                } catch (error) {

                    console.error(
                        "Admin login error:",
                        error
                    );

                    if (errorBox) {
                        errorBox.textContent =
                            error.message ||
                            "Login failed. Please try again.";
                    }

                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.textContent =
                            "Login";
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

        /* Protect dashboard */

        if (!isAdminLoggedIn()) {

            window.location.replace(
                "admin-login.html"
            );

            return;
        }


        let allComplaints = [];


        /* =====================================================
           STATUS HELPERS
        ===================================================== */

        function normalizeStatus(status) {

            const value =
                String(status || "")
                    .trim()
                    .toLowerCase();


            if (
                value === "under review" ||
                value === "under_review" ||
                value === "review"
            ) {
                return "Under Review";
            }


            if (
                value === "in progress" ||
                value === "in_progress" ||
                value === "progress"
            ) {
                return "In Progress";
            }


            if (
                value === "resolved" ||
                value === "resolve"
            ) {
                return "Resolved";
            }


            return "Submitted";
        }


        function getStatusClass(status) {

            const normalized =
                normalizeStatus(status);


            if (normalized === "Under Review") {
                return "status-under-review";
            }


            if (normalized === "In Progress") {
                return "status-in-progress";
            }


            if (normalized === "Resolved") {
                return "status-resolved";
            }


            return "status-submitted";
        }


        /* =====================================================
           DATE FORMAT
        ===================================================== */

        function formatDate(dateValue) {

            if (!dateValue) {
                return "—";
            }

            const date =
                new Date(dateValue);


            if (Number.isNaN(date.getTime())) {
                return String(dateValue);
            }


            return date.toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        }


        /* =====================================================
           LOAD COMPLAINTS
        ===================================================== */

        async function loadComplaints() {

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-row">
                        Loading complaints...
                    </td>
                </tr>
            `;


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/complaints`
                    );


                let data = {};

                try {
                    data = await response.json();
                } catch (jsonError) {
                    data = {};
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to load complaints."
                    );
                }


                allComplaints =
                    Array.isArray(data)
                        ? data
                        : (
                            data.complaints ||
                            data.data ||
                            []
                        );


                renderComplaints(
                    allComplaints
                );

                updateDashboardStats(
                    allComplaints
                );

            } catch (error) {

                console.error(
                    "Load complaints error:",
                    error
                );

                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8" class="error-row">
                            ${escapeHtml(
                                error.message ||
                                "Failed to load complaints."
                            )}
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

            if (!complaints ||
                complaints.length === 0
            ) {

                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-row">
                            No complaints found.
                        </td>
                    </tr>
                `;

                return;
            }


            complaintsContainer.innerHTML =
                complaints.map(
                    (complaint) => {

                        const complaintId =
                            complaint.complaint_id ||
                            complaint.id ||
                            "—";


                        const rollNo =
                            complaint.roll_no ||
                            "—";


                        const year =
                            complaint.year ||
                            "—";


                        const branch =
                            complaint.branch ||
                            "—";


                        const category =
                            complaint.category ||
                            "—";


                        const recipient =
                            complaint.recipient ||
                            complaint.sent_to ||
                            "—";


                        const status =
                            normalizeStatus(
                                complaint.status
                            );


                        const createdAt =
                            formatDate(
                                complaint.created_at
                            );


                        return `
                            <tr>

                                <td>
                                    <span class="complaint-id">
                                        ${escapeHtml(
                                            complaintId
                                        )}
                                    </span>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        rollNo
                                    )}
                                </td>

                                <td>
                                    <div class="class-info">
                                        <strong>
                                            ${escapeHtml(
                                                year
                                            )}
                                        </strong>
                                        <span>
                                            ${escapeHtml(
                                                branch
                                            )}
                                        </span>
                                    </div>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        category
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        recipient
                                    )}
                                </td>

                                <td>
                                    <span class="status-badge ${getStatusClass(
                                        status
                                    )}">
                                        ${escapeHtml(
                                            status
                                        )}
                                    </span>
                                </td>

                                <td>
                                    ${escapeHtml(
                                        createdAt
                                    )}
                                </td>

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

                            </tr>
                        `;
                    }
                ).join("");


            attachViewButtons();
        }


        /* =====================================================
           ATTACH VIEW BUTTONS
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


                            if (complaintId) {

                                openComplaintModal(
                                    complaintId
                                );
                            }
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


                let data = {};

                try {
                    data = await response.json();
                } catch (jsonError) {
                    data = {};
                }


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to load complaint."
                    );
                }


                const complaint =
                    data.complaint ||
                    data.data ||
                    data;


                /* Fill modal */

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
                        complaint.id ||
                        complaintId;
                }


                if (modalRollNo) {
                    modalRollNo.textContent =
                        complaint.roll_no ||
                        "—";
                }


                if (modalYear) {
                    modalYear.textContent =
                        complaint.year ||
                        "—";
                }


                if (modalBranch) {
                    modalBranch.textContent =
                        complaint.branch ||
                        "—";
                }


                if (modalCategory) {
                    modalCategory.textContent =
                        complaint.category ||
                        "—";
                }


                if (modalRecipient) {
                    modalRecipient.textContent =
                        complaint.recipient ||
                        complaint.sent_to ||
                        "—";
                }


                if (modalDate) {
                    modalDate.textContent =
                        formatDate(
                            complaint.created_at
                        );
                }


                const normalizedStatus =
                    normalizeStatus(
                        complaint.status
                    );


                if (modalStatus) {

                    modalStatus.textContent =
                        normalizedStatus;

                    modalStatus.className =
                        `status-badge ${getStatusClass(
                            normalizedStatus
                        )}`;
                }


                if (statusSelect) {
                    statusSelect.value =
                        normalizedStatus;
                }


                if (modalMessage) {
                    modalMessage.textContent =
                        complaint.message ||
                        "No complaint description.";
                }


                /* Save currently opened complaint */

                const modal =
                    document.getElementById(
                        "complaintModal"
                    );


                if (modal) {

                    modal.dataset.complaintId =
                        complaint.complaint_id ||
                        complaint.id ||
                        complaintId;


                    modal.classList.add("show");

                    modal.style.display = "flex";
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
           CLOSE COMPLAINT MODAL
        ===================================================== */

        function closeComplaintModal() {

            const modal =
                document.getElementById(
                    "complaintModal"
                );


            if (modal) {

                modal.classList.remove("show");

                modal.style.display = "none";
            }
        }


        const closeModalButton =
            document.getElementById(
                "closeModal"
            );


        if (closeModalButton) {

            closeModalButton.addEventListener(
                "click",
                closeComplaintModal
            );
        }


        const complaintModal =
            document.getElementById(
                "complaintModal"
            );


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


        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Escape") {

                    closeComplaintModal();
                }
            }
        );


        /* =====================================================
           UPDATE COMPLAINT STATUS
        ===================================================== */

        const updateStatusButton =
            document.getElementById(
                "updateStatusButton"
            );


        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    const modal =
                        document.getElementById(
                            "complaintModal"
                        );

                    const statusSelect =
                        document.getElementById(
                            "statusSelect"
                        );

                    const messageBox =
                        document.getElementById(
                            "statusUpdateMessage"
                        );


                    const complaintId =
                        modal
                            ? modal.dataset.complaintId
                            : "";


                    const status =
                        statusSelect
                            ? statusSelect.value
                            : "";


                    if (!complaintId) {

                        if (messageBox) {
                            messageBox.textContent =
                                "Complaint ID not found.";
                        }

                        return;
                    }


                    if (!status) {

                        if (messageBox) {
                            messageBox.textContent =
                                "Please select a status.";
                        }

                        return;
                    }


                    if (messageBox) {
                        messageBox.textContent =
                            "Updating...";
                    }


                    updateStatusButton.disabled =
                        true;


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


                        let data = {};

                        try {
                            data =
                                await response.json();
                        } catch (jsonError) {
                            data = {};
                        }


                        if (!response.ok) {

                            throw new Error(
                                data.message ||
                                data.error ||
                                "Failed to update complaint status."
                            );
                        }


                        if (messageBox) {

                            messageBox.textContent =
                                "Status updated successfully!";
                        }


                        /* Refresh dashboard */

                        await loadComplaints();


                        /*
                           Keep modal open briefly so the
                           success message can be seen.
                        */

                        setTimeout(() => {

                            closeComplaintModal();

                        }, 700);

                    } catch (error) {

                        console.error(
                            "Status update error:",
                            error
                        );

                        if (messageBox) {

                            messageBox.textContent =
                                error.message ||
                                "Failed to update status.";
                        }

                    } finally {

                        updateStatusButton.disabled =
                            false;
                    }
                }
            );
        }


        /* =====================================================
           SEARCH + FILTER
        ===================================================== */

        const searchInput =
            document.getElementById(
                "searchComplaint"
            );


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );


        function applyComplaintFilters() {

            const searchValue =
                searchInput
                    ? searchInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            const filterValue =
                statusFilter
                    ? statusFilter.value
                    : "all";


            const filtered =
                allComplaints.filter(
                    (complaint) => {

                        const complaintId =
                            String(
                                complaint.complaint_id ||
                                complaint.id ||
                                ""
                            ).toLowerCase();


                        const rollNo =
                            String(
                                complaint.roll_no ||
                                ""
                            ).toLowerCase();


                        const category =
                            String(
                                complaint.category ||
                                ""
                            ).toLowerCase();


                        const recipient =
                            String(
                                complaint.recipient ||
                                complaint.sent_to ||
                                ""
                            ).toLowerCase();


                        const status =
                            normalizeStatus(
                                complaint.status
                            );


                        const matchesSearch =
                            !searchValue ||
                            complaintId.includes(
                                searchValue
                            ) ||
                            rollNo.includes(
                                searchValue
                            ) ||
                            category.includes(
                                searchValue
                            ) ||
                            recipient.includes(
                                searchValue
                            );


                        const matchesStatus =
                            filterValue === "all" ||
                            normalizeStatus(
                                filterValue
                            ) === status;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );


            renderComplaints(filtered);
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyComplaintFilters
            );
        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyComplaintFilters
            );
        }


        /* =====================================================
           DASHBOARD STATISTICS
        ===================================================== */

        function updateDashboardStats(
            complaints
        ) {

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


            let submitted = 0;
            let underReview = 0;
            let resolved = 0;


            complaints.forEach(
                (complaint) => {

                    const status =
                        normalizeStatus(
                            complaint.status
                        );


                    if (
                        status ===
                        "Submitted"
                    ) {
                        submitted++;
                    }


                    if (
                        status ===
                        "Under Review"
                    ) {
                        underReview++;
                    }


                    if (
                        status ===
                        "Resolved"
                    ) {
                        resolved++;
                    }
                }
            );


            if (totalComplaints) {
                totalComplaints.textContent =
                    complaints.length;
            }


            if (submittedCount) {
                submittedCount.textContent =
                    submitted;
            }


            if (reviewCount) {
                reviewCount.textContent =
                    underReview;
            }


            if (resolvedCount) {
                resolvedCount.textContent =
                    resolved;
            }
        }


        /* =====================================================
           REFRESH BUTTON
        ===================================================== */

        const refreshButton =
            document.getElementById(
                "refreshComplaints"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadComplaints
            );
        }


        /*
           Some dashboard versions may use a button
           with class .refresh-btn instead.
        */

        const refreshButtons =
            document.querySelectorAll(
                ".refresh-btn"
            );


        refreshButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    loadComplaints
                );
            }
        );


        /* =====================================================
           ADMIN LOGOUT
        ===================================================== */

        const logoutButtons =
            document.querySelectorAll(
                "#logoutBtn, .logout-btn"
            );


        logoutButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        sessionStorage.removeItem(
                            "adminLoggedIn"
                        );

                        window.location.replace(
                            "admin-login.html"
                        );
                    }
                );
            }
        );


        /* =====================================================
           INITIAL DASHBOARD LOAD
        ===================================================== */

        loadComplaints();
    }


    /* =========================================================
       STUDENT LOGOUT SUPPORT
    ========================================================= */

    const studentLogoutButtons =
        document.querySelectorAll(
            "#studentLogoutBtn, .student-logout-btn"
        );


    studentLogoutButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    sessionStorage.removeItem(
                        "studentRollNumber"
                    );

                    sessionStorage.removeItem(
                        "complaintId"
                    );

                    sessionStorage.removeItem(
                        "lastComplaintId"
                    );

                    window.location.replace(
                        "login.html"
                    );
                }
            );
        }
    );


    /* =========================================================
       FIX SUBMIT COMPLAINT NAVIGATION
    ========================================================= */

    /*
       If a student is already logged in, clicking
       "Submit Complaint" should ALWAYS open contact.html,
       never login.html.
    */

    const submitComplaintLinks =
        document.querySelectorAll(
            'a[href="login.html"], a[href="./login.html"]'
        );


    submitComplaintLinks.forEach(
        (link) => {

            const text =
                link.textContent
                    .trim()
                    .toLowerCase();


            if (
                text.includes("submit complaint")
            ) {

                link.setAttribute(
                    "href",
                    "contact.html"
                );
            }
        }
    );

});
