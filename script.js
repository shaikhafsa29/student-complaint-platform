document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "";

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


        studentLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const rollNumber =
                    rollNumberInput.value
                        .trim()
                        .toUpperCase();


                if (!rollNumber) {

                    if (studentLoginError) {

                        studentLoginError.textContent =
                            "Please enter your Roll Number.";

                        studentLoginError.classList.remove(
                            "hidden"
                        );

                    }

                    return;

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
                                    roll_no:
                                        rollNumber
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

                    if (studentLoginError) {

                        studentLoginError.textContent =
                            error.message;

                        studentLoginError.classList.remove(
                            "hidden"
                        );

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
            .pop() || "index.html";


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
        document.getElementById(
            "complaintForm"
        );


    if (complaintForm) {

        const message =
            document.getElementById(
                "message"
            );


        const charCount =
            document.getElementById(
                "charCount"
            );


        if (
            message &&
            charCount
        ) {

            charCount.textContent =
                `${message.value.length} / 1000`;


            message.addEventListener(
                "input",
                () => {

                    charCount.textContent =
                        `${message.value.length} / 1000`;

                }
            );

        }


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
                    document.getElementById(
                        "year"
                    );


                const branchElement =
                    document.getElementById(
                        "branch"
                    );


                const categoryElement =
                    document.getElementById(
                        "category"
                    );


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


                const complaintMessage =
                    message
                        ? message.value.trim()
                        : "";


                if (
                    !year ||
                    !branch ||
                    !category ||
                    !complaintMessage
                ) {

                    alert(
                        "Please fill in all required fields."
                    );

                    return;

                }


                const submitButton =
                    complaintForm.querySelector(
                        ".submit-btn"
                    );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Submitting...";

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/complaints`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        roll_no:
                                            rollNumber,

                                        year:
                                            year,

                                        branch:
                                            branch,

                                        category:
                                            category,

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


                    window.location.href =
                        "success.html";


                } catch (error) {

                    console.error(
                        "Submission error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Something went wrong. Please try again."
                    );


                    if (submitButton) {

                        submitButton.disabled =
                            false;

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

    const complaintIdDisplay =
        document.getElementById(
            "complaintId"
        );


    if (complaintIdDisplay) {

        const complaintId =
            sessionStorage.getItem(
                "complaintId"
            );


        if (complaintId) {

            complaintIdDisplay.textContent =
                complaintId;

        }

    }


    /* =========================================================
       COMPLAINT TRACKING
    ========================================================= */

    const trackForm =
        document.getElementById(
            "trackForm"
        );


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

                    alert(
                        "Please enter your Complaint ID."
                    );

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


                const trackButton =
                    trackForm.querySelector(
                        ".submit-btn"
                    );


                if (trackButton) {

                    trackButton.disabled =
                        true;

                    trackButton.textContent =
                        "Searching...";

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/complaints/${complaintId}`
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

                    console.error(
                        "Tracking error:",
                        error
                    );


                    if (trackingError) {

                        trackingError.textContent =
                            error.message;

                        trackingError.classList.remove(
                            "hidden"
                        );

                    }

                } finally {

                    if (trackButton) {

                        trackButton.disabled =
                            false;

                        trackButton.textContent =
                            "Track Status 🔍";

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


        adminLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const loginButton =
                    adminLoginForm.querySelector(
                        ".submit-btn"
                    );


                if (loginButton) {

                    loginButton.disabled =
                        true;

                    loginButton.textContent =
                        "Logging in...";

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/api/admin/login`,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

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
                            error.message;

                        loginError.classList.remove(
                            "hidden"
                        );

                    }

                } finally {

                    if (loginButton) {

                        loginButton.disabled =
                            false;

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

        if (
            sessionStorage.getItem(
                "adminLoggedIn"
            ) !== "true"
        ) {

            window.location.href =
                "admin-login.html";

            return;

        }


        let allComplaints = [];

        let selectedComplaintId = null;


        const refreshButton =
            document.getElementById(
                "refreshComplaints"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        const searchComplaint =
            document.getElementById(
                "searchComplaint"
            );


        const statusFilter =
            document.getElementById(
                "statusFilter"
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


        const statusSelect =
            document.getElementById(
                "statusSelect"
            );


        /* =====================================================
           LOAD COMPLAINTS
        ===================================================== */

        async function loadComplaints() {

            complaintsContainer.innerHTML =
                `
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
                        "Failed to load complaints."
                    );

                }


                allComplaints =
                    result.complaints;


                updateStatistics();

                renderComplaints(
                    allComplaints
                );


            } catch (error) {

                console.error(
                    error
                );


                complaintsContainer.innerHTML =
                    `
                    <tr>
                        <td colspan="7">
                            Unable to load complaints.
                        </td>
                    </tr>
                    `;

            }

        }


        /* =====================================================
           UPDATE STATISTICS
        ===================================================== */

        function updateStatistics() {

            const total =
                allComplaints.length;


            const submitted =
                allComplaints.filter(
                    complaint =>
                        complaint.status ===
                        "Submitted"
                ).length;


            const underReview =
                allComplaints.filter(
                    complaint =>
                        complaint.status ===
                        "Under Review"
                ).length;


            const resolved =
                allComplaints.filter(
                    complaint =>
                        complaint.status ===
                        "Resolved"
                ).length;


            const totalElement =
                document.getElementById(
                    "totalComplaints"
                );


            const submittedElement =
                document.getElementById(
                    "submittedCount"
                );


            const reviewElement =
                document.getElementById(
                    "reviewCount"
                );


            const resolvedElement =
                document.getElementById(
                    "resolvedCount"
                );


            if (totalElement) {

                totalElement.textContent =
                    total;

            }


            if (submittedElement) {

                submittedElement.textContent =
                    submitted;

            }


            if (reviewElement) {

                reviewElement.textContent =
                    underReview;

            }


            if (resolvedElement) {

                resolvedElement.textContent =
                    resolved;

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
                complaints.length === 0
            ) {

                complaintsContainer.innerHTML =
                    `
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


                    row.innerHTML =
                        `

                        <td>
                            ${complaint.complaint_id}
                        </td>

                        <td>
                            ${complaint.year}
                            /
                            ${complaint.branch}
                        </td>

                        <td>
                            ${complaint.category}
                        </td>

                        <td>
                            -
                        </td>

                        <td>
                            ${complaint.status}
                        </td>

                        <td>
                            ${complaint.created_at}
                        </td>

                        <td>

                            <button
                                class="view-btn"
                                data-id="${complaint.complaint_id}"
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


            document.querySelectorAll(
                ".view-btn"
            ).forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const complaintId =
                                button.dataset.id;


                            const complaint =
                                allComplaints.find(
                                    item =>
                                        item.complaint_id ===
                                        complaintId
                                );


                            if (complaint) {

                                openComplaintModal(
                                    complaint
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

        function openComplaintModal(
            complaint
        ) {

            selectedComplaintId =
                complaint.complaint_id;


            document.getElementById(
                "modalComplaintId"
            ).textContent =
                complaint.complaint_id;


            document.getElementById(
                "modalYear"
            ).textContent =
                complaint.year;


            document.getElementById(
                "modalBranch"
            ).textContent =
                complaint.branch;


            document.getElementById(
                "modalCategory"
            ).textContent =
                complaint.category;


            document.getElementById(
                "modalRecipient"
            ).textContent =
                "-";


            document.getElementById(
                "modalDate"
            ).textContent =
                complaint.created_at;


            document.getElementById(
                "modalStatus"
            ).textContent =
                complaint.status;


            document.getElementById(
                "modalMessage"
            ).textContent =
                complaint.message;


            if (statusSelect) {

                statusSelect.value =
                    complaint.status;

            }


            if (complaintModal) {

                complaintModal.classList.add(
                    "active"
                );

            }

        }


        /* =====================================================
           CLOSE MODAL
        ===================================================== */

        if (closeModal) {

            closeModal.addEventListener(
                "click",
                () => {

                    complaintModal.classList.remove(
                        "active"
                    );

                }
            );

        }


        window.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    complaintModal
                ) {

                    complaintModal.classList.remove(
                        "active"
                    );

                }

            }
        );


        /* =====================================================
           UPDATE COMPLAINT STATUS
        ===================================================== */

        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    if (!selectedComplaintId) {

                        return;

                    }


                    const newStatus =
                        statusSelect.value;


                    updateStatusButton.disabled =
                        true;


                    updateStatusButton.textContent =
                        "Updating...";


                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/complaints/${selectedComplaintId}/status`,
                                {

                                    method:
                                        "PUT",

                                    headers: {

                                        "Content-Type":
                                            "application/json"

                                    },

                                    body:
                                        JSON.stringify({

                                            status:
                                                newStatus

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


                        document.getElementById(
                            "modalStatus"
                        ).textContent =
                            newStatus;


                        await loadComplaints();


                        const statusMessage =
                            document.getElementById(
                                "statusUpdateMessage"
                            );


                        if (statusMessage) {

                            statusMessage.textContent =
                                "Status updated successfully!";

                        }


                    } catch (error) {

                        alert(
                            error.message
                        );

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
           SEARCH AND FILTER
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
                    complaint => {

                        const matchesSearch =
                            complaint.complaint_id
                                .toUpperCase()
                                .includes(
                                    searchValue
                                );


                        const matchesStatus =
                            selectedStatus ===
                            "All"
                            ||
                            complaint.status ===
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
