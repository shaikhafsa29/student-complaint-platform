
document.addEventListener("DOMContentLoaded", () => {

    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    const API_BASE = isLocalhost
        ? "http://127.0.0.1:5000"
        : "";


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

        return (
            sessionStorage.getItem("studentRollNumber") ||
            ""
        ).trim();

    }


    async function apiRequest(
        endpoint,
        options = {}
    ) {

        const response = await fetch(
            `${API_BASE}${endpoint}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );


        let data = {};

        try {

            data = await response.json();

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Request failed with status ${response.status}.`
            );

        }


        return data;

    }


    /* =========================================================
       STUDENT LOGIN
    ========================================================= */

    const studentLoginForm =
        document.getElementById("studentLoginForm");


    if (studentLoginForm) {

        const rollInput =
            document.getElementById("studentRollNumber");

        const loginButton =
            document.getElementById("studentLoginBtn");

        const loginError =
            document.getElementById("studentLoginError");


        studentLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                hideElement(loginError);


                const rollNo =
                    rollInput.value.trim();


                if (!rollNo) {

                    loginError.textContent =
                        "Please enter your Roll Number.";

                    showElement(loginError);

                    return;

                }


                loginButton.disabled = true;
                loginButton.textContent = "Checking...";


                try {

                    const data = await apiRequest(
                        "/api/student/login",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                roll_no: rollNo
                            })
                        }
                    );


                    if (data.success) {

                        sessionStorage.setItem(
                            "studentRollNumber",
                            data.roll_no || rollNo
                        );


                        window.location.href =
                            "index.html";

                    }

                } catch (error) {

                    loginError.textContent =
                        error.message ||
                        "Unable to login. Please try again.";

                    showElement(loginError);

                } finally {

                    loginButton.disabled = false;
                    loginButton.textContent = "Continue →";

                }

            }
        );

    }


    /* =========================================================
       STUDENT PAGE PROTECTION
    ========================================================= */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const protectedStudentPages = [
        "index.html",
        "about.html",
        "contact.html",
        "track.html",
        "success.html"
    ];


    if (
        protectedStudentPages.includes(currentPage) &&
        !getStudentRollNumber()
    ) {

        window.location.href = "login.html";

        return;

    }


    /* =========================================================
       COMPLAINT FORM
    ========================================================= */

    const complaintForm =
        document.getElementById("complaintForm");


    if (complaintForm) {

        const yearInput =
            document.getElementById("year");

        const branchInput =
            document.getElementById("branch");

        const categoryInput =
            document.getElementById("category");

        const recipientInput =
            document.getElementById("recipient");

        const messageInput =
            document.getElementById("message");

        const charCount =
            document.getElementById("charCount");

        const errorBox =
            document.getElementById("complaintError");

        const submitButton =
            document.getElementById("complaintSubmitBtn");


        function updateCharacterCount() {

            if (!messageInput || !charCount) {
                return;
            }

            charCount.textContent =
                messageInput.value.length;

        }


        if (messageInput) {

            messageInput.addEventListener(
                "input",
                updateCharacterCount
            );

            updateCharacterCount();

        }


        complaintForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                hideElement(errorBox);


                const rollNo =
                    getStudentRollNumber();

                const year =
                    yearInput.value.trim();

                const branch =
                    branchInput.value.trim();

                const category =
                    categoryInput.value.trim();

                const recipient =
                    recipientInput.value.trim();

                const message =
                    messageInput.value.trim();


                if (!rollNo) {

                    errorBox.textContent =
                        "Student login is required.";

                    showElement(errorBox);

                    return;

                }


                if (
                    !year ||
                    !branch ||
                    !category ||
                    !recipient ||
                    !message
                ) {

                    errorBox.textContent =
                        "Please complete all required fields.";

                    showElement(errorBox);

                    return;

                }


                if (message.length > 1000) {

                    errorBox.textContent =
                        "Complaint description cannot exceed 1000 characters.";

                    showElement(errorBox);

                    return;

                }


                submitButton.disabled = true;
                submitButton.textContent = "Submitting...";


                try {

                    const data = await apiRequest(
                        "/api/complaints",
                        {
                            method: "POST",
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


                    if (
                        data.success &&
                        data.complaint_id
                    ) {

                        sessionStorage.setItem(
                            "complaintId",
                            data.complaint_id
                        );


                        complaintForm.reset();

                        updateCharacterCount();


                        window.location.href =
                            "success.html";

                    } else {

                        throw new Error(
                            data.message ||
                            "Complaint submission failed."
                        );

                    }

                } catch (error) {

                    errorBox.textContent =
                        error.message ||
                        "Unable to submit complaint. Please try again.";

                    showElement(errorBox);

                } finally {

                    submitButton.disabled = false;
                    submitButton.textContent =
                        "Submit Complaint →";

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
            sessionStorage.getItem("complaintId");


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
        document.getElementById("trackForm");


    if (trackForm) {

        const complaintIdInput =
            document.getElementById("trackComplaintId");

        const resultBox =
            document.getElementById("trackingResult");

        const errorBox =
            document.getElementById("trackingError");

        const resultComplaintId =
            document.getElementById("resultComplaintId");

        const resultCategory =
            document.getElementById("resultCategory");

        const resultStatus =
            document.getElementById("resultStatus");

        const resultDate =
            document.getElementById("resultDate");


        const savedComplaintId =
            sessionStorage.getItem("complaintId");


        if (
            savedComplaintId &&
            complaintIdInput
        ) {

            complaintIdInput.value =
                savedComplaintId;

        }


        trackForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                hideElement(resultBox);
                hideElement(errorBox);


                const complaintId =
                    complaintIdInput.value.trim();


                if (!complaintId) {

                    errorBox.querySelector("p").textContent =
                        "Please enter your Complaint ID.";

                    showElement(errorBox);

                    return;

                }


                try {

                    const data = await apiRequest(
                        `/api/complaints/${encodeURIComponent(complaintId)}`
                    );


                    const complaint =
                        data.complaint;


                    resultComplaintId.textContent =
                        complaint.complaint_id || "-";


                    resultCategory.textContent =
                        complaint.category || "-";


                    resultStatus.textContent =
                        complaint.status || "-";


                    resultDate.textContent =
                        complaint.created_at || "-";


                    showElement(resultBox);

                } catch (error) {

                    errorBox.querySelector("p").textContent =
                        error.message ||
                        "Please check your Complaint ID and try again.";

                    showElement(errorBox);

                }

            }
        );

    }


    /* =========================================================
       ADMIN LOGIN
    ========================================================= */

    const adminLoginForm =
        document.getElementById("adminLoginForm");


    if (adminLoginForm) {

        const usernameInput =
            document.getElementById("adminUsername");

        const passwordInput =
            document.getElementById("adminPassword");

        const loginError =
            document.getElementById("loginError");


        adminLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                hideElement(loginError);


                const username =
                    usernameInput.value.trim();

                const password =
                    passwordInput.value;


                try {

                    const data = await apiRequest(
                        "/api/admin/login",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );


                    if (data.success) {

                        sessionStorage.setItem(
                            "adminLoggedIn",
                            "true"
                        );


                        window.location.href =
                            "admin-dashboard.html";

                    }

                } catch (error) {

                    loginError.textContent =
                        error.message ||
                        "Invalid username or password.";

                    showElement(loginError);

                }

            }
        );

    }


    /* =========================================================
       ADMIN DASHBOARD
    ========================================================= */

    const complaintsContainer =
        document.getElementById("complaintsContainer");


    if (complaintsContainer) {

        const adminLoggedIn =
            sessionStorage.getItem("adminLoggedIn");


        if (adminLoggedIn !== "true") {

            window.location.href =
                "admin-login.html";

            return;

        }


        const totalComplaints =
            document.getElementById("totalComplaints");

        const submittedCount =
            document.getElementById("submittedCount");

        const reviewCount =
            document.getElementById("reviewCount");

        const resolvedCount =
            document.getElementById("resolvedCount");

        const searchInput =
            document.getElementById("searchComplaint");

        const statusFilter =
            document.getElementById("statusFilter");

        const refreshButton =
            document.getElementById("refreshComplaints");

        const logoutButton =
            document.getElementById("logoutButton");


        const modal =
            document.getElementById("complaintModal");

        const closeModalButton =
            document.getElementById("closeModal");

        const modalComplaintId =
            document.getElementById("modalComplaintId");

        const modalRollNo =
            document.getElementById("modalRollNo");

        const modalYear =
            document.getElementById("modalYear");

        const modalBranch =
            document.getElementById("modalBranch");

        const modalCategory =
            document.getElementById("modalCategory");

        const modalRecipient =
            document.getElementById("modalRecipient");

        const modalDate =
            document.getElementById("modalDate");

        const modalStatus =
            document.getElementById("modalStatus");

        const modalMessage =
            document.getElementById("modalMessage");

        const statusSelect =
            document.getElementById("statusSelect");

        const updateStatusButton =
            document.getElementById("updateStatusButton");

        const statusUpdateMessage =
            document.getElementById("statusUpdateMessage");


        let complaints = [];

        let currentComplaintId = "";


        function escapeHtml(value) {

            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function statusClass(status) {

            if (status === "Submitted") {
                return "status-submitted";
            }

            if (status === "Under Review") {
                return "status-review";
            }

            if (status === "In Progress") {
                return "status-progress";
            }

            if (status === "Resolved") {
                return "status-resolved";
            }

            return "";

        }


        function updateStats() {

            totalComplaints.textContent =
                complaints.length;


            submittedCount.textContent =
                complaints.filter(
                    item => item.status === "Submitted"
                ).length;


            reviewCount.textContent =
                complaints.filter(
                    item => item.status === "Under Review"
                ).length;


            resolvedCount.textContent =
                complaints.filter(
                    item => item.status === "Resolved"
                ).length;

        }


        function renderComplaints() {

            const searchTerm =
                (searchInput.value || "")
                    .trim()
                    .toLowerCase();


            const selectedStatus =
                statusFilter.value;


            const filtered =
                complaints.filter(
                    complaint => {

                        const matchesSearch =
                            !searchTerm ||
                            complaint.complaint_id
                                .toLowerCase()
                                .includes(searchTerm);


                        const matchesStatus =
                            selectedStatus === "All" ||
                            complaint.status === selectedStatus;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );


            if (!filtered.length) {

                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-table">
                            No complaints found.
                        </td>
                    </tr>
                `;

                return;

            }


            complaintsContainer.innerHTML =
                filtered.map(
                    complaint => {

                        const classBranch =
                            `${complaint.year || "-"} / ${complaint.branch || "-"}`;


                        return `
                            <tr>

                                <td>
                                    <strong>
                                        ${escapeHtml(complaint.complaint_id)}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHtml(classBranch)}
                                </td>

                                <td>
                                    ${escapeHtml(complaint.category || "-")}
                                </td>

                                <td>
                                    <span class="status-badge ${statusClass(complaint.status)}">
                                        ${escapeHtml(complaint.status || "-")}
                                    </span>
                                </td>

                                <td>
                                    ${escapeHtml(complaint.created_at || "-")}
                                </td>

                                <td>
                                    <button
                                        class="view-btn"
                                        data-complaint-id="${escapeHtml(complaint.complaint_id)}">

                                        View

                                    </button>
                                </td>

                            </tr>
                        `;

                    }
                ).join("");

        }


        async function loadComplaints() {

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">
                        Loading complaints...
                    </td>
                </tr>
            `;


            try {

                const data =
                    await apiRequest(
                        "/api/complaints"
                    );


                complaints =
                    Array.isArray(data.complaints)
                        ? data.complaints
                        : [];


                updateStats();
                renderComplaints();

            } catch (error) {

                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-table">
                            Unable to load complaints.
                        </td>
                    </tr>
                `;

                console.error(
                    "Unable to load complaints:",
                    error
                );

            }

        }


        function openModal(complaint) {

            currentComplaintId =
                complaint.complaint_id;


            modalComplaintId.textContent =
                complaint.complaint_id || "-";


            modalRollNo.textContent =
                complaint.roll_no || "-";


            modalYear.textContent =
                complaint.year || "-";


            modalBranch.textContent =
                complaint.branch || "-";


            modalCategory.textContent =
                complaint.category || "-";


            modalRecipient.textContent =
                complaint.recipient || "-";


            modalDate.textContent =
                complaint.created_at || "-";


            modalStatus.textContent =
                complaint.status || "-";


            modalMessage.textContent =
                complaint.message || "-";


            statusSelect.value =
                complaint.status || "Submitted";


            statusUpdateMessage.textContent =
                "";


            modal.classList.add("show");

        }


        function closeModal() {

            modal.classList.remove("show");

            currentComplaintId = "";

        }


        complaintsContainer.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".view-btn"
                    );


                if (!button) {
                    return;
                }


                const complaintId =
                    button.dataset.complaintId;


                const complaint =
                    complaints.find(
                        item =>
                            item.complaint_id === complaintId
                    );


                if (complaint) {

                    openModal(complaint);

                }

            }
        );


        closeModalButton.addEventListener(
            "click",
            closeModal
        );


        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    closeModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    modal.classList.contains("show")
                ) {

                    closeModal();

                }

            }
        );


        updateStatusButton.addEventListener(
            "click",
            async () => {

                if (!currentComplaintId) {
                    return;
                }


                const newStatus =
                    statusSelect.value;


                updateStatusButton.disabled = true;

                updateStatusButton.textContent =
                    "Updating...";

                statusUpdateMessage.textContent =
                    "";


                try {

                    const data =
                        await apiRequest(
                            `/api/complaints/${encodeURIComponent(currentComplaintId)}/status`,
                            {
                                method: "PUT",
                                body: JSON.stringify({
                                    status: newStatus
                                })
                            }
                        );


                    statusUpdateMessage.textContent =
                        data.message ||
                        "Status updated successfully.";


                    const complaint =
                        complaints.find(
                            item =>
                                item.complaint_id ===
                                currentComplaintId
                        );


                    if (complaint) {

                        complaint.status =
                            newStatus;

                    }


                    modalStatus.textContent =
                        newStatus;


                    updateStats();
                    renderComplaints();

                } catch (error) {

                    statusUpdateMessage.textContent =
                        error.message ||
                        "Unable to update status.";

                } finally {

                    updateStatusButton.disabled = false;

                    updateStatusButton.textContent =
                        "✓ Update Status";

                }

            }
        );


        searchInput.addEventListener(
            "input",
            renderComplaints
        );


        statusFilter.addEventListener(
            "change",
            renderComplaints
        );


        refreshButton.addEventListener(
            "click",
            loadComplaints
        );


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


        loadComplaints();

    }

});

