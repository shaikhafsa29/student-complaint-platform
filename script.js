document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE = "";


/* =========================================================
   COMPLAINT SUBMISSION
========================================================= */

const complaintForm = document.getElementById("complaintForm");

if (complaintForm) {

    const message = document.getElementById("message");
    const charCount = document.getElementById("charCount");

    if (message && charCount) {
        message.addEventListener("input", () => {
            charCount.textContent = `${message.value.length} / 1000`;
        });
    }

    complaintForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const year = document.getElementById("year").value;
        const branch = document.getElementById("branch").value;
        const category = document.getElementById("category").value;
        const recipient = document.getElementById("recipient").value;
        const complaintMessage = message.value.trim();

        if (!year || !branch || !category || !recipient || !complaintMessage) {
            alert("Please fill in all required fields.");
            return;
        }

        const submitButton = complaintForm.querySelector(".submit-btn");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {

            const response = await fetch(`${API_BASE}/api/complaints`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    year: year,
                    branch: branch,
                    category: category,
                    recipient: recipient,
                    message: complaintMessage
                })
            });

            const result = await response.json();

            console.log("Complaint response:", result);

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Failed to submit complaint."
                );
            }

            const complaintId = result.complaint_id;

            if (!complaintId) {
                throw new Error(
                    "Complaint submitted, but no Complaint ID was received."
                );
            }

            sessionStorage.setItem("complaintId", complaintId);

            window.location.href = "success.html";

        } catch (error) {

            console.error("Submission error:", error);

            alert(
                error.message ||
                "Something went wrong. Please try again."
            );

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Submit Complaint →";
            }
        }
    });
}


/* =========================================================
   COMPLAINT TRACKING
========================================================= */

const trackForm = document.getElementById("trackForm");

if (trackForm) {

    const complaintIdInput =
        document.getElementById("trackComplaintId");

    const trackingResult =
        document.getElementById("trackingResult");

    const trackingError =
        document.getElementById("trackingError");

    const resultComplaintId =
        document.getElementById("resultComplaintId");

    const resultCategory =
        document.getElementById("resultCategory");

    const resultStatus =
        document.getElementById("resultStatus");

    const resultDate =
        document.getElementById("resultDate");

    trackForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const complaintId =
            complaintIdInput.value.trim().toUpperCase();

        if (!complaintId) {
            alert("Please enter your Complaint ID.");
            return;
        }

        if (trackingResult) {
            trackingResult.classList.add("hidden");
        }

        if (trackingError) {
            trackingError.classList.add("hidden");
        }

        const trackButton =
            trackForm.querySelector(".submit-btn");

        if (trackButton) {
            trackButton.disabled = true;
            trackButton.textContent = "Searching...";
        }

        try {

            const response = await fetch(
                `${API_BASE}/api/complaints/${complaintId}`
            );

            const result = await response.json();

            if (!response.ok || !result.success) {

                if (trackingError) {
                    trackingError.classList.remove("hidden");
                }

                return;
            }

            const complaint = result.complaint;

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

            const statusMessage =
                document.getElementById("statusMessage");

            if (statusMessage) {

                if (complaint.status === "Submitted") {
                    statusMessage.textContent =
                        "Your complaint has been submitted successfully and is waiting for review.";
                }

                else if (complaint.status === "Under Review") {
                    statusMessage.textContent =
                        "Your complaint is currently being reviewed by the administration.";
                }

                else if (complaint.status === "In Progress") {
                    statusMessage.textContent =
                        "Action is currently being taken regarding your complaint.";
                }

                else if (complaint.status === "Resolved") {
                    statusMessage.textContent =
                        "Your complaint has been resolved.";
                }

                else {
                    statusMessage.textContent =
                        "Your complaint status has been updated.";
                }
            }

            if (resultDate && complaint.created_at) {

                const date = new Date(
                    complaint.created_at.replace(" ", "T")
                );

                resultDate.textContent =
                    date.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    });
            }

            if (trackingResult) {
                trackingResult.classList.remove("hidden");
            }

        } catch (error) {

            console.error("Tracking error:", error);

            if (trackingError) {
                trackingError.classList.remove("hidden");
            }

        } finally {

            if (trackButton) {
                trackButton.disabled = false;
                trackButton.textContent = "Track Status 🔍";
            }
        }
    });
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

const adminLoginForm =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    const adminUsername =
        document.getElementById("adminUsername");

    const adminPassword =
        document.getElementById("adminPassword");

    const loginError =
        document.getElementById("loginError");

    adminLoginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (loginError) {
            loginError.classList.add("hidden");
        }

        const loginButton =
            adminLoginForm.querySelector(".submit-btn");

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
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
                        username: adminUsername.value.trim(),
                        password: adminPassword.value
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
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

            console.error("Admin login error:", error);

            if (loginError) {
                loginError.textContent =
                    error.message ||
                    "Login failed. Please try again.";

                loginError.classList.remove("hidden");
            }

        } finally {

            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent =
                    "Login to Dashboard →";
            }
        }
    });
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const complaintsContainer =
    document.getElementById("complaintsContainer");

if (complaintsContainer) {

    if (
        sessionStorage.getItem("adminLoggedIn") !== "true"
    ) {
        window.location.href = "admin-login.html";
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

    const refreshButton =
        document.getElementById("refreshComplaints");

    const searchComplaint =
        document.getElementById("searchComplaint");

    const statusFilter =
        document.getElementById("statusFilter");

    const logoutButton =
        document.getElementById("logoutButton");

    const complaintModal =
        document.getElementById("complaintModal");

    const closeModal =
        document.getElementById("closeModal");

    const modalComplaintId =
        document.getElementById("modalComplaintId");

    const modalYear =
        document.getElementById("modalYear");

    const modalBranch =
        document.getElementById("modalBranch");

    const modalCategory =
        document.getElementById("modalCategory");

    const modalRecipient =
        document.getElementById("modalRecipient");

    const modalStatus =
        document.getElementById("modalStatus");

    const modalDate =
        document.getElementById("modalDate");

    const modalMessage =
        document.getElementById("modalMessage");

    const statusSelect =
        document.getElementById("statusSelect");

    const updateStatusButton =
        document.getElementById("updateStatusButton");

    const statusUpdateMessage =
        document.getElementById("statusUpdateMessage");

    let selectedComplaintId = null;
    let allComplaints = [];


    function formatDate(dateString) {

        if (!dateString) {
            return "-";
        }

        const date = new Date(
            dateString.replace(" ", "T")
        );

        return date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }


    function updateStatistics(complaints) {

        if (totalComplaints) {
            totalComplaints.textContent =
                complaints.length;
        }

        if (submittedCount) {
            submittedCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status === "Submitted"
                ).length;
        }

        if (reviewCount) {
            reviewCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status === "Under Review"
                ).length;
        }

        if (resolvedCount) {
            resolvedCount.textContent =
                complaints.filter(
                    complaint =>
                        complaint.status === "Resolved"
                ).length;
        }
    }


    function displayComplaints(complaints) {

        complaintsContainer.innerHTML = "";

        if (complaints.length === 0) {

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        No complaints found.
                    </td>
                </tr>
            `;

            return;
        }

        complaints.forEach((complaint) => {

            const row = document.createElement("tr");

            let statusClass = "submitted";

            if (complaint.status === "Under Review") {
                statusClass = "review";
            }

            else if (complaint.status === "In Progress") {
                statusClass = "progress";
            }

            else if (complaint.status === "Resolved") {
                statusClass = "resolved";
            }

            row.innerHTML = `
                <td>
                    <strong class="complaint-id-cell">
                        ${complaint.complaint_id}
                    </strong>
                </td>

                <td>
                    ${complaint.year}
                    <br>
                    <span class="branch-text">
                        ${complaint.branch}
                    </span>
                </td>

                <td>
                    ${complaint.category}
                </td>

                <td>
                    ${complaint.recipient || "-"}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${complaint.status}
                    </span>
                </td>

                <td>
                    ${formatDate(complaint.created_at)}
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

            complaintsContainer.appendChild(row);
        });
    }


    function filterComplaints() {

        const searchValue =
            searchComplaint
                ? searchComplaint.value.trim().toUpperCase()
                : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "All";

        const filteredComplaints =
            allComplaints.filter((complaint) => {

                const matchesSearch =
                    complaint.complaint_id
                        .toUpperCase()
                        .includes(searchValue);

                const matchesStatus =
                    selectedStatus === "All" ||
                    complaint.status === selectedStatus;

                return matchesSearch && matchesStatus;
            });

        displayComplaints(filteredComplaints);
    }


    function openComplaintModal(complaint) {

        if (!complaint || !complaintModal) {
            return;
        }

        selectedComplaintId =
            complaint.complaint_id;

        if (modalComplaintId) {
            modalComplaintId.textContent =
                complaint.complaint_id;
        }

        if (modalYear) {
            modalYear.textContent =
                complaint.year;
        }

        if (modalBranch) {
            modalBranch.textContent =
                complaint.branch;
        }

        if (modalCategory) {
            modalCategory.textContent =
                complaint.category;
        }

        if (modalRecipient) {
            modalRecipient.textContent =
                complaint.recipient || "-";
        }

        if (modalStatus) {
            modalStatus.textContent =
                complaint.status;
        }

        if (modalDate) {
            modalDate.textContent =
                formatDate(complaint.created_at);
        }

        if (modalMessage) {
            modalMessage.textContent =
                complaint.message;
        }

        if (statusSelect) {
            statusSelect.value =
                complaint.status;
        }

        if (statusUpdateMessage) {
            statusUpdateMessage.textContent = "";
        }

        complaintModal.classList.add("show");
    }


    async function viewComplaint(
        complaintId,
        viewButton
    ) {

        try {

            if (viewButton) {
                viewButton.disabled = true;
                viewButton.textContent = "Opening...";
            }

            const response = await fetch(
                `${API_BASE}/api/admin/complaints/${complaintId}/view`,
                {
                    method: "POST"
                }
            );

            const result =
                await response.json();

            if (!response.ok || !result.success) {
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
                        complaint.complaint_id === complaintId
                );

            if (index !== -1) {
                allComplaints[index] =
                    updatedComplaint;
            }

            updateStatistics(allComplaints);
            filterComplaints();
            openComplaintModal(updatedComplaint);

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
                viewButton.disabled = false;
                viewButton.textContent = "View";
            }
        }
    }


    if (updateStatusButton) {

        updateStatusButton.addEventListener(
            "click",
            async () => {

                if (!selectedComplaintId) {
                    alert("No complaint selected.");
                    return;
                }

                const newStatus =
                    statusSelect.value;

                updateStatusButton.disabled = true;

                updateStatusButton.textContent =
                    "Updating...";

                if (statusUpdateMessage) {
                    statusUpdateMessage.textContent = "";
                }

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
                                        status: newStatus
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

                    if (modalStatus) {
                        modalStatus.textContent =
                            updatedComplaint.status;
                    }

                    if (statusSelect) {
                        statusSelect.value =
                            updatedComplaint.status;
                    }

                    updateStatistics(allComplaints);
                    filterComplaints();

                    if (statusUpdateMessage) {
                        statusUpdateMessage.textContent =
                            "✓ Status updated successfully";
                    }

                } catch (error) {

                    console.error(
                        "Status update error:",
                        error
                    );

                    if (statusUpdateMessage) {
                        statusUpdateMessage.textContent =
                            error.message ||
                            "Failed to update status.";
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


    complaintsContainer.addEventListener(
        "click",
        (event) => {

            const viewButton =
                event.target.closest(".view-btn");

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


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            () => {

                if (complaintModal) {
                    complaintModal.classList.remove(
                        "show"
                    );
                }
            }
        );
    }


    if (complaintModal) {

        complaintModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === complaintModal
                ) {
                    complaintModal.classList.remove(
                        "show"
                    );
                }
            }
        );
    }


    if (searchComplaint) {
        searchComplaint.addEventListener(
            "input",
            filterComplaints
        );
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            filterComplaints
        );
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


    async function loadComplaints() {

        complaintsContainer.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
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

            updateStatistics(allComplaints);
            filterComplaints();

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">
                        Unable to load complaints.
                        Please try again.
                    </td>
                </tr>
            `;
        }
    }


    loadComplaints();
}


});
