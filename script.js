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


        studentLoginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const rollNumber =
                rollNumberInput.value
                    .trim()
                    .toUpperCase();


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
                                "Content-Type": "application/json"
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
                    result.roll_no
                );


                window.location.href =
                    "index.html";


            } catch (error) {

                studentLoginError.textContent =
                    error.message ||
                    "Unable to login.";

                studentLoginError.classList.remove("hidden");

            }

        });

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

            message.addEventListener("input", () => {

                charCount.textContent =
                    `${message.value.length} / 1000`;

            });

        }


        complaintForm.addEventListener("submit", async (event) => {

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
                document.getElementById("year").value.trim();

            const branch =
                document.getElementById("branch").value.trim();

            const category =
                document.getElementById("category").value.trim();

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


            submitButton.disabled = true;

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


                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Complaint →";

            }

        });

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


                const trackButton =
                    trackForm.querySelector(
                        ".submit-btn"
                    );


                trackButton.disabled = true;

                trackButton.textContent =
                    "Searching...";


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

                        const date =
                            new Date(
                                complaint.created_at
                                    .replace(
                                        " ",
                                        "T"
                                    )
                            );


                        resultDate.textContent =
                            date.toLocaleString(
                                "en-IN"
                            );

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


                } finally {

                    trackButton.disabled = false;

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


                const loginButton =
                    adminLoginForm.querySelector(
                        ".submit-btn"
                    );


                loginButton.disabled = true;

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
                        error.message;

                    loginError.classList.remove(
                        "hidden"
                    );


                } finally {

                    loginButton.disabled = false;

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
                        "Failed to load complaints."
                    );

                }


                const complaints =
                    result.complaints;


                complaintsContainer.innerHTML =
                    "";


                if (
                    complaints.length === 0
                ) {

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
                                ${complaint.complaint_id}
                            </td>

                            <td>
                                ${complaint.year}
                            </td>

                            <td>
                                ${complaint.branch}
                            </td>

                            <td>
                                ${complaint.category}
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


            } catch (error) {

                console.error(error);


                complaintsContainer.innerHTML = `
                    <tr>
                        <td colspan="7">
                            Unable to load complaints.
                        </td>
                    </tr>
                `;

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
