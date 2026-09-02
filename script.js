document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "http://127.0.0.1:5000";


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

        const successBox =
            document.getElementById("successBox");

        const complaintIdElement =
            document.getElementById("complaintId");


        if (message && charCount) {

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

                const complaintMessage =
                    message.value.trim();


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


                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Submitting...";


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

                                body:
                                    JSON.stringify({
                                        year,
                                        branch,
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


                    if (complaintIdElement) {

                        complaintIdElement.textContent =
                            result.complaint_id;

                    }


                    complaintForm.style.display =
                        "none";


                    if (successBox) {

                        successBox.style.display =
                            "block";

                    }


                } catch (error) {

                    console.error(
                        "Submission error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Something went wrong. Please make sure the backend is running."
                    );


                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Complaint →";

                }

            }
        );

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

                    alert(
                        "Please enter your Complaint ID."
                    );

                    return;
                }


                trackingResult.classList.add(
                    "hidden"
                );

                trackingError.classList.add(
                    "hidden"
                );


                const trackButton =
                    trackForm.querySelector(
                        ".submit-btn"
                    );


                trackButton.disabled =
                    true;

                trackButton.textContent =
                    "Searching...";


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

                        trackingError.classList.remove(
                            "hidden"
                        );

                        return;
                    }


                    const complaint =
                        result.complaint;


                    resultComplaintId.textContent =
                        complaint.complaint_id;


                    resultCategory.textContent =
                        complaint.category;


                    resultStatus.textContent =
                        complaint.status;


                    const statusMessage =
                        document.getElementById(
                            "statusMessage"
                        );


                    if (statusMessage) {

                        if (
                            complaint.status ===
                            "Submitted"
                        ) {

                            statusMessage.textContent =
                                "Your complaint has been submitted successfully and is waiting for review.";

                        }

                        else if (
                            complaint.status ===
                            "Under Review"
                        ) {

                            statusMessage.textContent =
                                "Your complaint is currently being reviewed by the administration.";

                        }

                        else if (
                            complaint.status ===
                            "In Progress"
                        ) {

                            statusMessage.textContent =
                                "Action is currently being taken regarding your complaint.";

                        }

                        else if (
                            complaint.status ===
                            "Resolved"
                        ) {

                            statusMessage.textContent =
                                "Your complaint has been resolved.";

                        }

                        else {

                            statusMessage.textContent =
                                "Your complaint status has been updated.";

                        }

                    }


                    const date =
                        new Date(
                            complaint.created_at.replace(
                                " ",
                                "T"
                            )
                        );


                    resultDate.textContent =
                        date.toLocaleString(
                            "en-IN",
                            {
                                day: "numeric",

                                month: "short",

                                year: "numeric",

                                hour: "numeric",

                                minute: "2-digit"
                            }
                        );


                    trackingResult.classList.remove(
                        "hidden"
                    );


                } catch (error) {

                    console.error(
                        "Tracking error:",
                        error
                    );


                    trackingError.classList.remove(
                        "hidden"
                    );


                } finally {

                    trackButton.disabled =
                        false;

                    trackButton.textContent =
                        "Track Status 🔍";

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


                const loginButton =
                    adminLoginForm.querySelector(
                        ".submit-btn"
                    );


                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Logging in...";


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
                            "Invalid username or password"
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


                    loginError.textContent =
                        error.message ||
                        "Login failed. Please try again.";


                    loginError.classList.remove(
                        "hidden"
                    );


                } finally {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login to Dashboard →";

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


        /* =====================================================
           LOGIN CHECK
        ===================================================== */

        if (
            sessionStorage.getItem(
                "adminLoggedIn"
            ) !== "true"
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        /* =====================================================
           DASHBOARD ELEMENTS
        ===================================================== */

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

        const searchComplaint =
            document.getElementById(
                "searchComplaint"
            );

        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        /* =====================================================
           MODAL ELEMENTS
        ===================================================== */

        const complaintModal =
            document.getElementById(
                "complaintModal"
            );

        const closeModal =
            document.getElementById(
                "closeModal"
            );

        const modalComplaintId =
            document.getElementById(
                "modalComplaintId"
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

        const modalStatus =
            document.getElementById(
                "modalStatus"
            );

        const modalDate =
            document.getElementById(
                "modalDate"
            );

        const modalMessage =
            document.getElementById(
                "modalMessage"
            );


        const statusSelect =
            document.getElementById(
                "statusSelect"
            );

        const updateStatusButton =
            document.getElementById(
                "updateStatusButton"
            );

        const statusUpdateMessage =
            document.getElementById(
                "statusUpdateMessage"
            );


        let selectedComplaintId =
            null;


        /* =====================================================
           STORE COMPLAINTS
        ===================================================== */

        let allComplaints = [];


        /* =====================================================
           FORMAT DATE
        ===================================================== */

        function formatDate(
            dateString
        ) {

            const date =
                new Date(
                    dateString.replace(
                        " ",
                        "T"
                    )
                );


            return date.toLocaleString(
                "en-IN",
                {
                    day: "numeric",

                    month: "short",

                    year: "numeric",

                    hour: "numeric",

                    minute: "2-digit"
                }
            );

        }


        /* =====================================================
           UPDATE STATISTICS
        ===================================================== */

        function updateStatistics(
            complaints
        ) {

            totalComplaints.textContent =
                complaints.length;


            submittedCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status ===
                        "Submitted"
                ).length;


            reviewCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status ===
                        "Under Review"
                ).length;


            resolvedCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status ===
                        "Resolved"
                ).length;

        }


        /* =====================================================
           DISPLAY COMPLAINTS
        ===================================================== */

        function displayComplaints(
            complaints
        ) {

            complaintsContainer.innerHTML =
                "";


            if (
                complaints.length === 0
            ) {

                complaintsContainer.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="empty-table"
                        >
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


                    let statusClass =
                        "submitted";


                    if (
                        complaint.status ===
                        "Under Review"
                    ) {

                        statusClass =
                            "review";

                    }


                    if (
                        complaint.status ===
                        "In Progress"
                    ) {

                        statusClass =
                            "progress";

                    }


                    if (
                        complaint.status ===
                        "Resolved"
                    ) {

                        statusClass =
                            "resolved";

                    }


                    row.innerHTML = `

                        <td>

                            <strong
                                class="complaint-id-cell"
                            >
                                ${complaint.complaint_id}
                            </strong>

                        </td>


                        <td>

                            ${complaint.year}

                            <br>

                            <span
                                class="branch-text"
                            >
                                ${complaint.branch}
                            </span>

                        </td>


                        <td>
                            ${complaint.category}
                        </td>


                        <td>

                            <span
                                class="status-badge ${statusClass}"
                            >
                                ${complaint.status}
                            </span>

                        </td>


                        <td>
                            ${formatDate(
                                complaint.created_at
                            )}
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

        }


        /* =====================================================
           SEARCH + FILTER
        ===================================================== */

        function filterComplaints() {

            const searchValue =
                searchComplaint.value
                    .trim()
                    .toUpperCase();


            const selectedStatus =
                statusFilter.value;


            const filteredComplaints =
                allComplaints.filter(
                    (complaint) => {

                        const matchesSearch =
                            complaint.complaint_id
                                .toUpperCase()
                                .includes(
                                    searchValue
                                );


                        const matchesStatus =
                            selectedStatus ===
                                "All" ||
                            complaint.status ===
                                selectedStatus;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );


            displayComplaints(
                filteredComplaints
            );

        }


        /* =====================================================
           OPEN MODAL
        ===================================================== */

        function openComplaintModal(
            complaint
        ) {

            if (!complaint) {

                console.error(
                    "Complaint not found."
                );

                return;
            }


            selectedComplaintId =
                complaint.complaint_id;


            modalComplaintId.textContent =
                complaint.complaint_id;


            modalYear.textContent =
                complaint.year;


            modalBranch.textContent =
                complaint.branch;


            modalCategory.textContent =
                complaint.category;


            modalStatus.textContent =
                complaint.status;


            modalDate.textContent =
                formatDate(
                    complaint.created_at
                );


            modalMessage.textContent =
                complaint.message;


            if (statusSelect) {

                statusSelect.value =
                    complaint.status;

            }


            if (statusUpdateMessage) {

                statusUpdateMessage.textContent =
                    "";

            }


            complaintModal.classList.add(
                "show"
            );

        }


        /* =====================================================
           VIEW COMPLAINT
           
           Submitted → Under Review
        ===================================================== */

        async function viewComplaint(
            complaintId,
            viewButton
        ) {

            try {

                if (viewButton) {

                    viewButton.disabled =
                        true;

                    viewButton.textContent =
                        "Opening...";

                }


                const response =
                    await fetch(
                        `${API_BASE}/api/admin/complaints/${complaintId}/view`,
                        {
                            method: "POST"
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
                        "Unable to open complaint."
                    );

                }


                const updatedComplaint =
                    result.complaint;


                const index =
                    allComplaints.findIndex(
                        complaint =>
                            complaint.complaint_id ===
                            complaintId
                    );


                if (index !== -1) {

                    allComplaints[index] =
                        updatedComplaint;

                }


                updateStatistics(
                    allComplaints
                );


                filterComplaints();


                openComplaintModal(
                    updatedComplaint
                );


            } catch (error) {

                console.error(
                    "View complaint error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to open complaint."
                );

            } finally {

                if (viewButton) {

                    viewButton.disabled =
                        false;

                    viewButton.textContent =
                        "View";

                }

            }

        }


        /* =====================================================
           UPDATE STATUS
        ===================================================== */

        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    if (!selectedComplaintId) {

                        alert(
                            "No complaint selected."
                        );

                        return;
                    }


                    const newStatus =
                        statusSelect.value;


                    updateStatusButton.disabled =
                        true;

                    updateStatusButton.textContent =
                        "Updating...";


                    statusUpdateMessage.textContent =
                        "";


                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/admin/complaints/${selectedComplaintId}/status`,
                                {
                                    method: "PUT",

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


                        const updatedComplaint =
                            result.complaint;


                        const index =
                            allComplaints.findIndex(
                                complaint =>
                                    complaint.complaint_id ===
                                    selectedComplaintId
                            );


                        if (index !== -1) {

                            allComplaints[index] =
                                updatedComplaint;

                        }


                        modalStatus.textContent =
                            updatedComplaint.status;


                        statusSelect.value =
                            updatedComplaint.status;


                        updateStatistics(
                            allComplaints
                        );


                        filterComplaints();


                        statusUpdateMessage.textContent =
                            "✓ Status updated successfully";


                    } catch (error) {

                        console.error(
                            "Status update error:",
                            error
                        );


                        statusUpdateMessage.textContent =
                            error.message ||
                            "Failed to update status.";

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
           VIEW BUTTON EVENT
        ===================================================== */

        complaintsContainer.addEventListener(
            "click",
            (event) => {

                const viewButton =
                    event.target.closest(
                        ".view-btn"
                    );


                if (!viewButton) {
                    return;
                }


                const complaintId =
                    viewButton.dataset.id;


                viewComplaint(
                    complaintId,
                    viewButton
                );

            }
        );


        /* =====================================================
           CLOSE MODAL
        ===================================================== */

        if (closeModal) {

            closeModal.addEventListener(
                "click",
                () => {

                    complaintModal.classList.remove(
                        "show"
                    );

                }
            );

        }


        /* =====================================================
           CLOSE MODAL OUTSIDE
        ===================================================== */

        if (complaintModal) {

            complaintModal.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        complaintModal
                    ) {

                        complaintModal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }


        /* =====================================================
           SEARCH
        ===================================================== */

        if (searchComplaint) {

            searchComplaint.addEventListener(
                "input",
                filterComplaints
            );

        }


        /* =====================================================
           STATUS FILTER
        ===================================================== */

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                filterComplaints
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
           LOAD COMPLAINTS
        ===================================================== */

        async function loadComplaints() {

            complaintsContainer.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-table"
                    >
                        Loading complaints...
                    </td>
                </tr>
            `;


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/complaints`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to load complaints"
                    );

                }


                allComplaints =
                    await response.json();


                updateStatistics(
                    allComplaints
                );


                filterComplaints();


            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );


                complaintsContainer.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="empty-table"
                        >
                            Unable to load complaints.
                            Make sure Flask is running.
                        </td>
                    </tr>
                `;

            }

        }


        /* =====================================================
           INITIAL LOAD
        ===================================================== */

        loadComplaints();

    }

});
