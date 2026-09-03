document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       API BASE URL (Requirement 11)
    ========================================================= */
    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "" ||
        window.location.protocol === "file:";

    const API_BASE =
        isLocalhost
            ? "http://127.0.0.1:5000"
            : "";


    /* =========================================================
       STUDENT AUTHENTICATION / ROUTE PROTECTION (Requirement 12)
    ========================================================= */
    const currentPath = window.location.pathname.toLowerCase();
    const isStudentProtectedPage =
        currentPath.endsWith("contact.html") ||
        currentPath.endsWith("track.html") ||
        currentPath.endsWith("success.html");

    if (isStudentProtectedPage) {
        const studentRoll = sessionStorage.getItem("studentRollNumber");
        if (!studentRoll || !studentRoll.trim()) {
            window.location.href = "login.html";
            return;
        }
    }


    /* =========================================================
       1. STUDENT LOGIN (login.html)
    ========================================================= */
    const studentLoginForm = document.getElementById("studentLoginForm");

    if (studentLoginForm) {
        const studentRollInput = document.getElementById("studentRollNumber");
        const studentLoginError = document.getElementById("studentLoginError");

        // Allow entering a new Roll No., prefilling previous if available
        const existingRoll = sessionStorage.getItem("studentRollNumber");
        if (existingRoll && studentRollInput) {
            studentRollInput.value = existingRoll;
        }

        studentLoginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (studentLoginError) {
                studentLoginError.classList.add("hidden");
            }

            const rollNo = studentRollInput ? studentRollInput.value.trim().toUpperCase() : "";

            if (!rollNo) {
                if (studentLoginError) {
                    studentLoginError.textContent = "Please enter your Roll Number.";
                    studentLoginError.classList.remove("hidden");
                }
                return;
            }

            const submitBtn = studentLoginForm.querySelector(".submit-btn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Continuing...";
            }

            try {
                const response = await fetch(`${API_BASE}/api/student/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ roll_no: rollNo })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to log in.");
                }

                // Store in sessionStorage (Requirement 1)
                sessionStorage.setItem("studentRollNumber", rollNo);

                // Redirect to Submit Complaint page (Requirement 1)
                window.location.href = "contact.html";

            } catch (error) {
                console.error("Student login error:", error);
                let msg = error.message || "Could not log in. Please try again.";
                if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
                    msg = "Cannot connect to backend server. Make sure Flask is running (python app.py) and open http://127.0.0.1:5000 in your browser.";
                }
                if (studentLoginError) {
                    studentLoginError.textContent = msg;
                    studentLoginError.classList.remove("hidden");
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Continue to Submit Complaint →";
                }
            }
        });
    }


    /* =========================================================
       2. COMPLAINT SUBMISSION (contact.html)
    ========================================================= */
    const complaintForm = document.getElementById("complaintForm");

    if (complaintForm) {
        const messageInput = document.getElementById("message");
        const charCount = document.getElementById("charCount");

        if (messageInput && charCount) {
            messageInput.addEventListener("input", () => {
                charCount.textContent = `${messageInput.value.length} / 1000`;
            });
        }

        complaintForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Retrieve Roll No. from sessionStorage (Requirement 1 & 2)
            const rollNo = sessionStorage.getItem("studentRollNumber");

            if (!rollNo) {
                alert("Student Roll Number not found. Please log in first.");
                window.location.href = "login.html";
                return;
            }

            const year = document.getElementById("year").value.trim();
            const branch = document.getElementById("branch").value.trim();
            const category = document.getElementById("category").value.trim();
            const recipient = document.getElementById("recipient") ? document.getElementById("recipient").value.trim() : "";
            const complaintMessage = messageInput ? messageInput.value.trim() : "";

            if (!year || !branch || !category || !recipient || !complaintMessage) {
                alert("Please fill in all required fields.");
                return;
            }

            const submitBtn = complaintForm.querySelector(".submit-btn");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Submitting Complaint...";
            }

            try {
                const response = await fetch(`${API_BASE}/api/complaints`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        roll_no: rollNo,
                        year,
                        branch,
                        category,
                        recipient,
                        message: complaintMessage
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to submit complaint.");
                }

                // Store last complaint ID for tracking / success page
                sessionStorage.setItem("lastComplaintId", result.complaint_id);

                // Redirect to success.html (Requirement 4)
                window.location.href = `success.html?id=${encodeURIComponent(result.complaint_id)}`;

            } catch (error) {
                console.error("Submission error:", error);
                alert(error.message || "Something went wrong submitting your complaint.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Submit Complaint →";
                }
            }
        });
    }


    /* =========================================================
       3. SUCCESS PAGE (success.html)
    ========================================================= */
    const displayComplaintId = document.getElementById("displayComplaintId");

    if (displayComplaintId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get("id");
        const storedId = sessionStorage.getItem("lastComplaintId");
        const activeComplaintId = urlId || storedId || "CMP-UNKNOWN";

        displayComplaintId.textContent = activeComplaintId;

        const trackComplaintBtn = document.getElementById("trackComplaintBtn");
        if (trackComplaintBtn && activeComplaintId !== "CMP-UNKNOWN") {
            trackComplaintBtn.href = `track.html?id=${encodeURIComponent(activeComplaintId)}`;
        }
    }


    /* =========================================================
       4. COMPLAINT TRACKING (track.html)
    ========================================================= */
    const trackForm = document.getElementById("trackForm");

    if (trackForm) {
        const complaintIdInput = document.getElementById("trackComplaintId");
        const trackingResult = document.getElementById("trackingResult");
        const trackingError = document.getElementById("trackingError");

        const resultComplaintId = document.getElementById("resultComplaintId");
        const resultRollNo = document.getElementById("resultRollNo");
        const resultYear = document.getElementById("resultYear");
        const resultBranch = document.getElementById("resultBranch");
        const resultCategory = document.getElementById("resultCategory");
        const resultRecipient = document.getElementById("resultRecipient");
        const resultStatus = document.getElementById("resultStatus");
        const resultDate = document.getElementById("resultDate");
        const resultMessage = document.getElementById("resultMessage");

        function getStatusBadgeClass(status) {
            if (status === "Under Review") return "status-badge review";
            if (status === "In Progress") return "status-badge progress";
            if (status === "Resolved") return "status-badge resolved";
            return "status-badge submitted";
        }

        async function executeTrack(complaintId) {
            if (!complaintId) return;

            if (trackingResult) trackingResult.classList.add("hidden");
            if (trackingError) trackingError.classList.add("hidden");

            const trackButton = trackForm.querySelector(".submit-btn");
            if (trackButton) {
                trackButton.disabled = true;
                trackButton.textContent = "Searching...";
            }

            try {
                const response = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`);
                const result = await response.json();

                if (!response.ok || !result.success || !result.complaint) {
                    if (trackingError) {
                        trackingError.classList.remove("hidden");
                    }
                    return;
                }

                const c = result.complaint;

                if (resultComplaintId) resultComplaintId.textContent = c.complaint_id || "-";
                if (resultRollNo) resultRollNo.textContent = c.roll_no || "-";
                if (resultYear) resultYear.textContent = c.year || "-";
                if (resultBranch) resultBranch.textContent = c.branch || "-";
                if (resultCategory) resultCategory.textContent = c.category || "-";
                if (resultRecipient) resultRecipient.textContent = c.recipient || "-";

                if (resultStatus) {
                    resultStatus.textContent = c.status || "Submitted";
                    resultStatus.className = getStatusBadgeClass(c.status);
                }

                if (resultDate && c.created_at) {
                    try {
                        const dateObj = new Date(c.created_at.replace(" ", "T"));
                        resultDate.textContent = dateObj.toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                        });
                    } catch (e) {
                        resultDate.textContent = c.created_at;
                    }
                }

                if (resultMessage) {
                    resultMessage.textContent = c.message || "-";
                }

                if (trackingResult) {
                    trackingResult.classList.remove("hidden");
                }

            } catch (err) {
                console.error("Tracking error:", err);
                if (trackingError) {
                    trackingError.classList.remove("hidden");
                }
            } finally {
                if (trackButton) {
                    trackButton.disabled = false;
                    trackButton.textContent = "Track Status 🔍";
                }
            }
        }

        // Auto-search if query param ?id=... is present
        const urlParams = new URLSearchParams(window.location.search);
        const queryId = urlParams.get("id");
        if (queryId && complaintIdInput) {
            complaintIdInput.value = queryId;
            executeTrack(queryId.trim().toUpperCase());
        }

        trackForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const idVal = complaintIdInput ? complaintIdInput.value.trim().toUpperCase() : "";
            if (!idVal) {
                alert("Please enter your Complaint ID.");
                return;
            }
            executeTrack(idVal);
        });
    }


    /* =========================================================
       5. ADMIN LOGIN (admin-login.html)
    ========================================================= */
    const adminLoginForm = document.getElementById("adminLoginForm");

    if (adminLoginForm) {
        const adminUsername = document.getElementById("adminUsername");
        const adminPassword = document.getElementById("adminPassword");
        const loginError = document.getElementById("loginError");

        adminLoginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (loginError) loginError.classList.add("hidden");

            const loginButton = adminLoginForm.querySelector(".submit-btn");
            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Logging in...";
            }

            try {
                const response = await fetch(`${API_BASE}/api/admin/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: adminUsername ? adminUsername.value.trim() : "",
                        password: adminPassword ? adminPassword.value : ""
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Invalid username or password");
                }

                sessionStorage.setItem("adminLoggedIn", "true");
                window.location.href = "admin-dashboard.html";

            } catch (err) {
                console.error("Admin login error:", err);
                let msg = err.message || "Login failed. Please try again.";
                if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
                    msg = "Cannot connect to backend server. Make sure Flask is running (python app.py) and open http://127.0.0.1:5000 in your browser.";
                }
                if (loginError) {
                    loginError.textContent = msg;
                    loginError.classList.remove("hidden");
                }
            } finally {
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Login to Dashboard →";
                }
            }
        });
    }


    /* =========================================================
       6. ADMIN DASHBOARD (admin-dashboard.html)
    ========================================================= */
    const complaintsContainer = document.getElementById("complaintsContainer");

    if (complaintsContainer) {

        // Check Admin session
        if (sessionStorage.getItem("adminLoggedIn") !== "true") {
            window.location.href = "admin-login.html";
            return;
        }

        const totalComplaints = document.getElementById("totalComplaints");
        const submittedCount = document.getElementById("submittedCount");
        const reviewCount = document.getElementById("reviewCount");
        const progressCount = document.getElementById("progressCount");
        const resolvedCount = document.getElementById("resolvedCount");

        const refreshButton = document.getElementById("refreshComplaints");
        const searchComplaint = document.getElementById("searchComplaint");
        const statusFilter = document.getElementById("statusFilter");
        const logoutButton = document.getElementById("logoutButton");

        // Modal Elements
        const complaintModal = document.getElementById("complaintModal");
        const closeModal = document.getElementById("closeModal");
        const modalComplaintId = document.getElementById("modalComplaintId");
        const modalRollNo = document.getElementById("modalRollNo");
        const modalYear = document.getElementById("modalYear");
        const modalBranch = document.getElementById("modalBranch");
        const modalCategory = document.getElementById("modalCategory");
        const modalRecipient = document.getElementById("modalRecipient");
        const modalDate = document.getElementById("modalDate");
        const modalStatus = document.getElementById("modalStatus");
        const modalMessage = document.getElementById("modalMessage");

        const statusSelect = document.getElementById("statusSelect");
        const updateStatusButton = document.getElementById("updateStatusButton");
        const statusUpdateMessage = document.getElementById("statusUpdateMessage");

        let selectedComplaintId = null;
        let allComplaints = [];

        function formatDate(dateString) {
            if (!dateString) return "-";
            try {
                const date = new Date(dateString.replace(" ", "T"));
                return date.toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                });
            } catch (e) {
                return dateString;
            }
        }

        function updateStatistics(complaints) {
            if (totalComplaints) totalComplaints.textContent = complaints.length;
            if (submittedCount) {
                submittedCount.textContent = complaints.filter(c => c.status === "Submitted").length;
            }
            if (reviewCount) {
                reviewCount.textContent = complaints.filter(c => c.status === "Under Review").length;
            }
            if (progressCount) {
                progressCount.textContent = complaints.filter(c => c.status === "In Progress").length;
            }
            if (resolvedCount) {
                resolvedCount.textContent = complaints.filter(c => c.status === "Resolved").length;
            }
        }

        function displayComplaints(complaints) {
            complaintsContainer.innerHTML = "";

            if (complaints.length === 0) {
                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-table">
                            No complaints found.
                        </td>
                    </tr>
                `;
                return;
            }

            complaints.forEach((complaint) => {
                const row = document.createElement("tr");

                let statusBadgeClass = "status-badge submitted";
                if (complaint.status === "Under Review") statusBadgeClass = "status-badge review";
                if (complaint.status === "In Progress") statusBadgeClass = "status-badge progress";
                if (complaint.status === "Resolved") statusBadgeClass = "status-badge resolved";

                row.innerHTML = `
                    <td>
                        <strong class="complaint-id-cell">
                            ${complaint.complaint_id}
                        </strong>
                    </td>
                    <td>
                        <strong>${complaint.roll_no || "-"}</strong>
                    </td>
                    <td>
                        ${complaint.year}
                        <br>
                        <span class="branch-text">${complaint.branch}</span>
                    </td>
                    <td>
                        ${complaint.category}
                    </td>
                    <td>
                        <strong>${complaint.recipient || "Class Teacher"}</strong>
                    </td>
                    <td>
                        <span class="${statusBadgeClass}">
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
            const searchValue = searchComplaint ? searchComplaint.value.trim().toUpperCase() : "";
            const selectedStatus = statusFilter ? statusFilter.value : "All";

            const filtered = allComplaints.filter((complaint) => {
                const matchesSearch =
                    !searchValue ||
                    (complaint.complaint_id && complaint.complaint_id.toUpperCase().includes(searchValue)) ||
                    (complaint.roll_no && complaint.roll_no.toUpperCase().includes(searchValue)) ||
                    (complaint.branch && complaint.branch.toUpperCase().includes(searchValue));

                const matchesStatus =
                    selectedStatus === "All" ||
                    complaint.status === selectedStatus;

                return matchesSearch && matchesStatus;
            });

            displayComplaints(filtered);
        }

        function openComplaintModal(complaint) {
            if (!complaint) return;

            selectedComplaintId = complaint.complaint_id;

            if (modalComplaintId) modalComplaintId.textContent = complaint.complaint_id;
            if (modalRollNo) modalRollNo.textContent = complaint.roll_no || "-";
            if (modalYear) modalYear.textContent = complaint.year;
            if (modalBranch) modalBranch.textContent = complaint.branch;
            if (modalCategory) modalCategory.textContent = complaint.category;
            if (modalRecipient) modalRecipient.textContent = complaint.recipient || "-";
            if (modalStatus) modalStatus.textContent = complaint.status;
            if (modalDate) modalDate.textContent = formatDate(complaint.created_at);
            if (modalMessage) modalMessage.textContent = complaint.message;

            if (statusSelect) {
                statusSelect.value = complaint.status;
            }

            if (statusUpdateMessage) {
                statusUpdateMessage.textContent = "";
            }

            if (complaintModal) {
                complaintModal.classList.add("show");
            }
        }

        async function viewComplaint(complaintId, viewButton) {
            try {
                if (viewButton) {
                    viewButton.disabled = true;
                    viewButton.textContent = "Opening...";
                }

                const response = await fetch(`${API_BASE}/api/admin/complaints/${encodeURIComponent(complaintId)}/view`);
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Unable to open complaint.");
                }

                const updatedComplaint = result.complaint;

                const index = allComplaints.findIndex(c => c.complaint_id === complaintId);
                if (index !== -1) {
                    allComplaints[index] = updatedComplaint;
                }

                updateStatistics(allComplaints);
                filterComplaints();
                openComplaintModal(updatedComplaint);

            } catch (err) {
                console.error("View complaint error:", err);
                alert(err.message || "Unable to open complaint.");
            } finally {
                if (viewButton) {
                    viewButton.disabled = false;
                    viewButton.textContent = "View";
                }
            }
        }

        // Status update handler (Requirement 8)
        if (updateStatusButton) {
            updateStatusButton.addEventListener("click", async () => {
                if (!selectedComplaintId) {
                    alert("No complaint selected.");
                    return;
                }

                const newStatus = statusSelect.value;
                const allowedStatuses = ["Submitted", "Under Review", "In Progress", "Resolved"];

                if (!allowedStatuses.includes(newStatus)) {
                    if (statusUpdateMessage) {
                        statusUpdateMessage.textContent = "Invalid complaint status";
                        statusUpdateMessage.style.color = "#d14343";
                    }
                    return;
                }

                updateStatusButton.disabled = true;
                updateStatusButton.textContent = "Updating...";
                if (statusUpdateMessage) statusUpdateMessage.textContent = "";

                try {
                    const response = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(selectedComplaintId)}/status`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ status: newStatus })
                    });

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.message || "Failed to update status.");
                    }

                    const updated = result.complaint;

                    const idx = allComplaints.findIndex(c => c.complaint_id === selectedComplaintId);
                    if (idx !== -1) {
                        allComplaints[idx] = updated;
                    }

                    if (modalStatus) modalStatus.textContent = updated.status;
                    if (statusSelect) statusSelect.value = updated.status;

                    updateStatistics(allComplaints);
                    filterComplaints();

                    if (statusUpdateMessage) {
                        statusUpdateMessage.textContent = "✓ Status updated successfully";
                        statusUpdateMessage.style.color = "#159957";
                    }

                } catch (err) {
                    console.error("Status update error:", err);
                    if (statusUpdateMessage) {
                        statusUpdateMessage.textContent = err.message || "Failed to update status.";
                        statusUpdateMessage.style.color = "#d14343";
                    }
                } finally {
                    updateStatusButton.disabled = false;
                    updateStatusButton.textContent = "✓ Update Status";
                }
            });
        }

        // Table delegation for View buttons
        complaintsContainer.addEventListener("click", (event) => {
            const viewButton = event.target.closest(".view-btn");
            if (!viewButton) return;
            const cid = viewButton.dataset.id;
            viewComplaint(cid, viewButton);
        });

        // Close modal handlers
        if (closeModal) {
            closeModal.addEventListener("click", () => {
                if (complaintModal) complaintModal.classList.remove("show");
            });
        }

        if (complaintModal) {
            complaintModal.addEventListener("click", (event) => {
                if (event.target === complaintModal) {
                    complaintModal.classList.remove("show");
                }
            });
        }

        // Search and filter listeners
        if (searchComplaint) {
            searchComplaint.addEventListener("input", filterComplaints);
        }

        if (statusFilter) {
            statusFilter.addEventListener("change", filterComplaints);
        }

        if (refreshButton) {
            refreshButton.addEventListener("click", loadComplaints);
        }

        // Logout
        if (logoutButton) {
            logoutButton.addEventListener("click", () => {
                sessionStorage.removeItem("adminLoggedIn");
                window.location.href = "admin-login.html";
            });
        }

        async function loadComplaints() {
            complaintsContainer.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-table">
                        Loading complaints...
                    </td>
                </tr>
            `;

            try {
                const response = await fetch(`${API_BASE}/api/complaints`);
                if (!response.ok) {
                    throw new Error("Failed to load complaints");
                }

                allComplaints = await response.json();
                updateStatistics(allComplaints);
                filterComplaints();

            } catch (err) {
                console.error("Dashboard load error:", err);
                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-table">
                            Unable to load complaints. Make sure Flask backend is running.
                        </td>
                    </tr>
                `;
            }
        }

        // Initial load
        loadComplaints();
    }

});
