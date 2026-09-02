javascript
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       API BASE
       Local VS Code  -> Flask on port 5000
       Railway        -> same website/server
    ========================================================= */

    const API_BASE =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
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


        studentLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const rollNumber =
                    rollNumberInput.value.trim().toUpperCase();


                if (!rollNumber) {

                    studentLoginError.textContent =
                        "Please enter your Roll Number.";

                    studentLoginError.classList.remove("hidden");

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
                                    roll_no: rollNumber
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok || !result.success) {

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

                    console.error(
                        "Student login error:",
                        error
                    );

                    studentLoginError.textContent =
                        error.message ||
                        "Unable to connect to the server.";

                    studentLoginError.classList.remove(
                        "hidden"
                    );
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
        !sessionStorage.getItem("studentRollNumber")
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


                const rollNumber =
                    sessionStorage.getItem(
                        "studentRollNumber"
                    );


                if (!rollNumber) {

                    window.location.href =
                        "login.html";

                    return;
                }


                const year =
                    document
                        .getElementById("year")
                        .value
                        .trim();


                const branch =
                    document
                        .getElementById("branch")
                        .value
                        .trim();


                const category =
                    document
                        .getElementById("category")
                        .value
                        .trim();


                const recipientElement =
                    document.getElementById(
                        "recipient"
                    );


                const recipient =
                    recipientElement
                        ? recipientElement.value.trim()
                        : "";


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


                    /* SAVE COMPLAINT ID */

                    sessionStorage.setItem(
                        "complaintId",
                        result.complaint_id
                    );


                    /* GO TO SUCCESS PAGE */

                    window.location.href =
                        "success.html";


                } catch (error) {

                    console.error(
                        "Complaint submission error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Failed to fetch. Please check the server connection."
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


                    document.getElementById(
                        "resultComplaintId"
                    ).textContent =
                        complaint.complaint_id;


                    document.getElementById(
                        "resultCategory"
                    ).textContent =
                        complaint.category;


                    document.getElementById(
                        "resultStatus"
                    ).textContent =
                        complaint.status;


                    const resultDate =
                        document.getElementById(
                            "resultDate"
                        );


                    if (resultDate) {

                        resultDate.textContent =
                            complaint.created_at;
                    }


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
                        "Unable to connect to the server.";

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


        async function loadComplaints() {

            complaintsContainer.innerHTML =
                `<tr>
                    <td colspan="8">
                        Loading complaints...
                    </td>
                </tr>`;


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


                renderComplaints(
                    allComplaints
                );


                updateStatistics();


            } catch (error) {

                console.error(
                    "Admin dashboard error:",
                    error
                );


                complaintsContainer.innerHTML =
                    `<tr>
                        <td colspan="8">
                            Unable to load complaints.
                        </td>
                    </tr>`;
            }
        }


        function renderComplaints(
            complaints
        ) {

            complaintsContainer.innerHTML =
                "";


            if (complaints.length === 0) {

                complaintsContainer.innerHTML =
                    `<tr>
                        <td colspan="8">
                            No complaints found.
                        </td>
                    </tr>`;

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
                            ${complaint.complaint_id}
                        </td>

                        <td>
                            ${complaint.roll_no || "-"}
                        </td>

                        <td>
                            ${complaint.year}/${complaint.branch}
                        </td>

                        <td>
                            ${complaint.category}
                        </td>

                        <td>
                            ${complaint.recipient || "-"}
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
                                data-id="${complaint.complaint_id}">
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
                .querySelectorAll(".view-btn")
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


        async function openComplaintModal(
            complaintId
        ) {

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
                        "Unable to load complaint."
                    );
                }


                const complaint =
                    result.complaint;


                currentComplaintId =
                    complaint.complaint_id;


                document.getElementById(
                    "modalComplaintId"
                ).textContent =
                    complaint.complaint_id;


                const modalRollNo =
                    document.getElementById(
                        "modalRollNo"
                    );


                if (modalRollNo) {

                    modalRollNo.textContent =
                        complaint.roll_no || "-";
                }


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
                    complaint.recipient ||
                    "Not specified";


                document.getElementById(
                    "modalDate"
                ).textContent =
                    complaint.created_at;


                document.getElementById(
                    "modalStatus"
                ).textContent =
                    complaint.status;


                document.getElementById(
                    "statusSelect"
                ).value =
                    complaint.status;


                document.getElementById(
                    "modalMessage"
                ).textContent =
                    complaint.message;


                complaintModal.classList.add(
                    "show"
                );


            } catch (error) {

                alert(
                    error.message ||
                    "Unable to load complaint details."
                );
            }
        }


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


        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    if (!currentComplaintId) {
                        return;
                    }


                    const status =
                        document.getElementById(
                            "statusSelect"
                        ).value;


                    try {

                        const response =
                            await fetch(
                                `${API_BASE}/api/complaints/${currentComplaintId}/status`,
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
                            status;


                        await loadComplaints();


                    } catch (error) {

                        alert(
                            error.message ||
                            "Failed to update status."
                        );
                    }
                }
            );
        }


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

                        const matchesSearch =
                            complaint.complaint_id
                                .toUpperCase()
                                .includes(
                                    searchValue
                                );


                        const matchesStatus =
                            selectedStatus === "All" ||
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


        function updateStatistics() {

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


            if (totalComplaints) {

                totalComplaints.textContent =
                    allComplaints.length;
            }


            if (submittedCount) {

                submittedCount.textContent =
                    allComplaints.filter(
                        (c) =>
                            c.status ===
                            "Submitted"
                    ).length;
            }


            if (reviewCount) {

                reviewCount.textContent =
                    allComplaints.filter(
                        (c) =>
                            c.status ===
                            "Under Review"
                    ).length;
            }


            if (resolvedCount) {

                resolvedCount.textContent =
                    allComplaints.filter(
                        (c) =>
                            c.status ===
                            "Resolved"
                    ).length;
            }
        }


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadComplaints
            );
        }


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


        loadComplaints();
    }

});

