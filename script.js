document.addEventListener("DOMContentLoaded", () => {

    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    const API_BASE =
        isLocalhost
            ? "http://127.0.0.1:5000"
            : "";


    async function apiRequest(
        endpoint,
        options = {}
    ) {
        const response = await fetch(
            API_BASE + endpoint,
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
        } catch (error) {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                "Something went wrong."
            );
        }

        return data;
    }


    function getStudentRollNo() {
        return sessionStorage.getItem("studentRollNo") || "";
    }


    function getAdminToken() {
        return sessionStorage.getItem("adminToken") || "";
    }


    function requireStudentLogin() {
        const rollNo = getStudentRollNo();

        if (!rollNo) {
            window.location.href = "login.html";
            return false;
        }

        return true;
    }


    function requireAdminLogin() {
        const token = getAdminToken();

        if (!token) {
            window.location.href = "admin-login.html";
            return false;
        }

        return true;
    }


    function escapeHtml(value) {
        const div = document.createElement("div");

        div.textContent =
            value === null ||
            value === undefined
                ? ""
                : String(value);

        return div.innerHTML;
    }


    /* =========================
       STUDENT LOGIN
    ========================= */

    const studentLoginForm =
        document.getElementById("studentLoginForm");

    if (studentLoginForm) {

        studentLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const rollInput =
                    document.getElementById(
                        "studentRollNumber"
                    );

                const errorBox =
                    document.getElementById(
                        "studentLoginError"
                    );

                const button =
                    document.getElementById(
                        "studentLoginBtn"
                    );

                const rollNo =
                    rollInput.value.trim();

                errorBox.textContent = "";

                if (!rollNo) {
                    errorBox.textContent =
                        "Please enter your Roll Number.";

                    return;
                }

                button.disabled = true;
                button.textContent = "Checking...";

                try {

                    const data =
                        await apiRequest(
                            "/api/student/login",
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    roll_no: rollNo
                                })
                            }
                        );

                    sessionStorage.setItem(
                        "studentRollNo",
                        data.roll_no
                    );

                    window.location.href =
                        "contact.html";

                } catch (error) {

                    errorBox.textContent =
                        error.message;

                } finally {

                    button.disabled = false;
                    button.textContent =
                        "Continue";
                }
            }
        );
    }


    /* =========================
       COMPLAINT FORM
    ========================= */

    const complaintForm =
        document.getElementById("complaintForm");

    if (complaintForm) {

        if (!requireStudentLogin()) {
            return;
        }

        const messageInput =
            document.getElementById("message");

        const charCount =
            document.getElementById("charCount");

        if (messageInput && charCount) {

            const updateCharacterCount = () => {
                charCount.textContent =
                    messageInput.value.length;
            };

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

                const errorBox =
                    document.getElementById(
                        "complaintError"
                    );

                const button =
                    document.getElementById(
                        "complaintSubmitBtn"
                    );

                const rollNo =
                    getStudentRollNo();

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
                    document.getElementById(
                        "recipient"
                    ).value;

                const message =
                    document.getElementById(
                        "message"
                    ).value.trim();

                errorBox.textContent = "";

                if (!rollNo) {
                    window.location.href =
                        "login.html";

                    return;
                }

                if (!year ||
                    !branch ||
                    !category ||
                    !recipient ||
                    !message
                ) {
                    errorBox.textContent =
                        "Please complete all required fields.";

                    return;
                }

                if (message.length > 1000) {
                    errorBox.textContent =
                        "Complaint cannot exceed 1000 characters.";

                    return;
                }

                button.disabled = true;
                button.textContent = "Submitting...";

                try {

                    const data =
                        await apiRequest(
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

                    sessionStorage.setItem(
                        "lastComplaintId",
                        data.complaint_id
                    );

                    window.location.href =
                        "success.html";

                } catch (error) {

                    errorBox.textContent =
                        error.message;

                    button.disabled = false;
                    button.textContent =
                        "Submit Complaint";
                }
            }
        );
    }


    /* =========================
       SUCCESS PAGE
    ========================= */

    const successComplaintId =
        document.getElementById(
            "successComplaintId"
        );

    if (successComplaintId) {

        const complaintId =
            sessionStorage.getItem(
                "lastComplaintId"
            );

        if (complaintId) {

            successComplaintId.textContent =
                complaintId;

        } else {

            successComplaintId.textContent =
                "Complaint ID unavailable";
        }
    }


    /* =========================
       TRACK COMPLAINT
    ========================= */

    const trackForm =
        document.getElementById("trackForm");

    if (trackForm) {

        trackForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "trackComplaintId"
                    );

                const errorBox =
                    document.getElementById(
                        "trackingError"
                    );

                const resultBox =
                    document.getElementById(
                        "trackingResult"
                    );

                const complaintId =
                    input.value.trim().toUpperCase();

                errorBox.textContent = "";

                resultBox.classList.add(
                    "hidden"
                );

                if (!complaintId) {

                    errorBox.textContent =
                        "Please enter a Complaint ID.";

                    return;
                }

                try {

                    const data =
                        await apiRequest(
                            "/api/complaints/" +
                            encodeURIComponent(
                                complaintId
                            )
                        );

                    const complaint =
                        data.complaint;

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

                    document.getElementById(
                        "resultDate"
                    ).textContent =
                        complaint.created_at;

                    resultBox.classList.remove(
                        "hidden"
                    );

                } catch (error) {

                    errorBox.textContent =
                        error.message;
                }
            }
        );
    }


    /* =========================
       ADMIN LOGIN
    ========================= */

    const adminLoginForm =
        document.getElementById(
            "adminLoginForm"
        );

    if (adminLoginForm) {

        adminLoginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const username =
                    document.getElementById(
                        "adminUsername"
                    ).value.trim();

                const password =
                    document.getElementById(
                        "adminPassword"
                    ).value;

                const errorBox =
                    document.getElementById(
                        "loginError"
                    );

                errorBox.textContent = "";

                try {

                    const data =
                        await apiRequest(
                            "/api/admin/login",
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    username: username,
                                    password: password
                                })
                            }
                        );

                    sessionStorage.setItem(
                        "adminToken",
                        data.token
                    );

                    window.location.href =
                        "admin-dashboard.html";

                } catch (error) {

                    errorBox.textContent =
                        error.message;
                }
            }
        );
    }


    /* =========================
       ADMIN DASHBOARD
    ========================= */

    const complaintsContainer =
        document.getElementById(
            "complaintsContainer"
        );

    if (complaintsContainer) {

        if (!requireAdminLogin()) {
            return;
        }

        let complaints = [];
        let selectedComplaint = null;


        async function loadComplaints() {

            try {

                const data =
                    await apiRequest(
                        "/api/complaints",
                        {
                            headers: {
                                Authorization:
                                    "Bearer " +
                                    getAdminToken()
                            }
                        }
                    );

                complaints =
                    data.complaints || [];

                updateStats();
                renderComplaints();

            } catch (error) {

                if (
                    error.message.toLowerCase()
                        .includes("authentication")
                ) {

                    sessionStorage.removeItem(
                        "adminToken"
                    );

                    window.location.href =
                        "admin-login.html";

                    return;
                }

                complaintsContainer.innerHTML =
                    `
                    <tr>
                        <td colspan="6">
                            Unable to load complaints.
                        </td>
                    </tr>
                    `;
            }
        }


        function updateStats() {

            const total =
                complaints.length;

            const submitted =
                complaints.filter(
                    item =>
                        item.status === "Submitted"
                ).length;

            const review =
                complaints.filter(
                    item =>
                        item.status === "Under Review"
                ).length;

            const resolved =
                complaints.filter(
                    item =>
                        item.status === "Resolved"
                ).length;

            document.getElementById(
                "totalComplaints"
            ).textContent = total;

            document.getElementById(
                "submittedCount"
            ).textContent = submitted;

            document.getElementById(
                "reviewCount"
            ).textContent = review;

            document.getElementById(
                "resolvedCount"
            ).textContent = resolved;
        }


        function renderComplaints() {

            const search =
                (
                    document.getElementById(
                        "searchComplaint"
                    )?.value || ""
                ).toLowerCase().trim();

            const filter =
                document.getElementById(
                    "statusFilter"
                )?.value || "All";


            const filtered =
                complaints.filter(
                    complaint => {

                        const searchable =
                            [
                                complaint.complaint_id,
                                complaint.roll_no,
                                complaint.year,
                                complaint.branch,
                                complaint.category,
                                complaint.recipient
                            ]
                            .join(" ")
                            .toLowerCase();

                        const matchesSearch =
                            !search ||
                            searchable.includes(
                                search
                            );

                        const matchesStatus =
                            filter === "All" ||
                            complaint.status === filter;

                        return (
                            matchesSearch &&
                            matchesStatus
                        );
                    }
                );


            if (!filtered.length) {

                complaintsContainer.innerHTML =
                    `
                    <tr>
                        <td colspan="6">
                            No complaints found.
                        </td>
                    </tr>
                    `;

                return;
            }


            complaintsContainer.innerHTML =
                filtered.map(
                    complaint =>
                        `
                        <tr>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        complaint.complaint_id
                                    )}
                                </strong>
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
                                <span class="status-badge">
                                    ${escapeHtml(
                                        complaint.status
                                    )}
                                </span>
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
                                >
                                    View
                                </button>
                            </td>

                        </tr>
                        `
                ).join("");


            document
                .querySelectorAll(".view-btn")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            openComplaint(
                                button.dataset.id
                            );
                        }
                    );
                });
        }


        function openComplaint(complaintId) {

            selectedComplaint =
                complaints.find(
                    item =>
                        item.complaint_id ===
                        complaintId
                );

            if (!selectedComplaint) {
                return;
            }

            document.getElementById(
                "modalComplaintId"
            ).textContent =
                selectedComplaint.complaint_id;

            document.getElementById(
                "modalRollNo"
            ).textContent =
                selectedComplaint.roll_no;

            document.getElementById(
                "modalYear"
            ).textContent =
                selectedComplaint.year;

            document.getElementById(
                "modalBranch"
            ).textContent =
                selectedComplaint.branch;

            document.getElementById(
                "modalCategory"
            ).textContent =
                selectedComplaint.category;

            document.getElementById(
                "modalRecipient"
            ).textContent =
                selectedComplaint.recipient;

            document.getElementById(
                "modalDate"
            ).textContent =
                selectedComplaint.created_at;

            document.getElementById(
                "modalStatus"
            ).textContent =
                selectedComplaint.status;

            document.getElementById(
                "modalMessage"
            ).textContent =
                selectedComplaint.message;

            document.getElementById(
                "statusSelect"
            ).value =
                selectedComplaint.status;

            document.getElementById(
                "statusUpdateMessage"
            ).textContent = "";

            document.getElementById(
                "complaintModal"
            ).classList.remove(
                "hidden"
            );
        }


        const closeModal =
            document.getElementById(
                "closeModal"
            );

        if (closeModal) {

            closeModal.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "complaintModal"
                    ).classList.add(
                        "hidden"
                    );
                }
            );
        }


        const modal =
            document.getElementById(
                "complaintModal"
            );

        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );
                    }
                }
            );
        }


        const updateStatusButton =
            document.getElementById(
                "updateStatusButton"
            );

        if (updateStatusButton) {

            updateStatusButton.addEventListener(
                "click",
                async () => {

                    if (!selectedComplaint) {
                        return;
                    }

                    const status =
                        document.getElementById(
                            "statusSelect"
                        ).value;

                    const messageBox =
                        document.getElementById(
                            "statusUpdateMessage"
                        );

                    updateStatusButton.disabled =
                        true;

                    updateStatusButton.textContent =
                        "Updating...";

                    try {

                        await apiRequest(
                            "/api/complaints/" +
                            encodeURIComponent(
                                selectedComplaint.complaint_id
                            ) +
                            "/status",
                            {
                                method: "PUT",
                                headers: {
                                    Authorization:
                                        "Bearer " +
                                        getAdminToken()
                                },
                                body: JSON.stringify({
                                    status: status
                                })
                            }
                        );

                        messageBox.textContent =
                            "Status updated successfully.";

                        selectedComplaint.status =
                            status;

                        const index =
                            complaints.findIndex(
                                item =>
                                    item.complaint_id ===
                                    selectedComplaint.complaint_id
                            );

                        if (index !== -1) {
                            complaints[index].status =
                                status;
                        }

                        document.getElementById(
                            "modalStatus"
                        ).textContent =
                            status;

                        updateStats();
                        renderComplaints();

                    } catch (error) {

                        messageBox.textContent =
                            error.message;

                    } finally {

                        updateStatusButton.disabled =
                            false;

                        updateStatusButton.textContent =
                            "Update Status";
                    }
                }
            );
        }


        const searchInput =
            document.getElementById(
                "searchComplaint"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderComplaints
            );
        }


        const statusFilter =
            document.getElementById(
                "statusFilter"
            );

        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderComplaints
            );
        }


        const logoutButton =
            document.getElementById(
                "adminLogout"
            );

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        await apiRequest(
                            "/api/admin/logout",
                            {
                                method: "POST",
                                headers: {
                                    Authorization:
                                        "Bearer " +
                                        getAdminToken()
                                }
                            }
                        );

                    } catch (error) {
                    }

                    sessionStorage.removeItem(
                        "adminToken"
                    );

                    window.location.href =
                        "admin-login.html";
                }
            );
        }


        loadComplaints();
    }

});
