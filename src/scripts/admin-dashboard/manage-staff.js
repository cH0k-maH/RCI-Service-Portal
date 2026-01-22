window.initManageStaff = function () {
    console.log("Manage Staff initialized");

    // Check Auth & Permissions
    const currentUser = {
        role: localStorage.getItem("staffType"),
        branch: localStorage.getItem("branch"),
        isAdmin: window.AuthService.getRole() === 'admin'
    };
    const isGlobalAdmin = currentUser.isAdmin || (currentUser.role && currentUser.role.toUpperCase() === 'ADMIN');

    if (!window.UserService.can(currentUser, "view_branch_users") && !isGlobalAdmin) {
        document.getElementById("dashboard-container").innerHTML = "<div class='p-10 text-red-600'>Access Denied.</div>";
        return;
    }

    // Update Title
    const pageTitle = document.querySelector("#dashboard-container h2");
    if (pageTitle) pageTitle.textContent = "Branch Staff Management";

    // === UI Elements ===
    const tableBody = document.getElementById("users-table-body");
    const noUsersMsg = document.getElementById("no-users-msg");
    const searchInput = document.getElementById("user-search");
    const branchFilter = document.getElementById("branch-filter");
    const deptFilter = document.getElementById("dept-filter");
    const statusFilter = document.getElementById("status-filter");

    // Modal Elements
    const modalOverlay = document.getElementById("user-modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const userForm = document.getElementById("user-form");
    const addUserBtn = document.getElementById("addUserBtn");
    const closeBtn = document.getElementById("close-user-modal");
    const cancelBtn = document.getElementById("cancel-user-modal");

    // Action Modal Elements
    const actionModalOverlay = document.getElementById("staff-action-modal-overlay");
    const actionStaffName = document.getElementById("action-staff-name");
    const actionStaffRole = document.getElementById("action-staff-role");
    const closeActionModalBtn = document.getElementById("close-action-modal");

    const btnAssignTask = document.getElementById("btn-assign-task");
    const btnReviewReports = document.getElementById("btn-review-reports");
    const btnIssueQuery = document.getElementById("btn-issue-query");
    const btnEditProfile = document.getElementById("btn-edit-staff-profile");

    // Admin-Only: Add Staff Button
    if (addUserBtn && !isGlobalAdmin) {
        addUserBtn.style.display = 'none';
    }

    // Hide Type Selector if it exists in HTML (we are hardcoding Staff)
    const accountTypeSelector = document.getElementById("account-type-selector");
    if (accountTypeSelector) {
        accountTypeSelector.closest("div").style.display = 'none';
    }

    // Show only Staff Section
    const sectionStaff = document.getElementById("form-section-staff");
    const sectionDealer = document.getElementById("form-section-dealer");
    const sectionCustomer = document.getElementById("form-section-customer");

    if (sectionStaff) sectionStaff.classList.remove("hidden");
    if (sectionDealer) sectionDealer.classList.add("hidden");
    if (sectionCustomer) sectionCustomer.classList.add("hidden");

    // Input Fields
    const inputs = {
        id: document.getElementById("user-id"),
        status: document.getElementById("common-status"),
        notes: document.getElementById("common-notes"),
        staffName: document.getElementById("staff-name"),
        staffEmail: document.getElementById("staff-email"),
        staffPhone: document.getElementById("staff-phone"),
        staffRole: document.getElementById("staff-role"),
        staffBranch: document.getElementById("staff-branch"),
        staffId: document.getElementById("staff-id"),
        staffPicture: document.getElementById("staff-picture"),
        staffDropbox: document.getElementById("staff-dropbox")
    };

    // === Render Function ===
    function renderTable() {
        let users = window.UserService.getAllUsers();

        // Filter for STAFF only
        users = users.filter(u => u.type !== 'customer' && u.type !== 'dealer');

        // Filters
        const searchTerm = searchInput.value.toLowerCase();
        const deptTerm = deptFilter ? deptFilter.value : "";
        const statusTerm = statusFilter ? statusFilter.value : "";

        // Enforce Branch
        let branchTerm = branchFilter ? branchFilter.value : "";
        if (!isGlobalAdmin) {
            branchTerm = currentUser.branch;
            if (branchFilter) {
                branchFilter.value = branchTerm;
                branchFilter.style.display = "none";
                branchFilter.parentElement.style.display = "none"; // Hide the parent label/container too
            }
        } else {
            // Admin can see the filter
            if (branchFilter) branchFilter.classList.remove("hidden");
        }

        const filteredUsers = users.filter(user => {
            // 1. Branch Restriction
            if (branchTerm && user.branch !== branchTerm) return false;

            // 2. Department/Role Filter
            if (deptTerm && user.role !== deptTerm) {
                if (!(deptTerm === 'Logistics' && user.role === 'Driver')) return false;
            }

            // 3. Status Filter
            if (statusTerm && user.status !== statusTerm) return false;

            // 4. Search
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(searchTerm) || email.includes(searchTerm);
        });

        tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {
            noUsersMsg.classList.remove("hidden");
            noUsersMsg.textContent = "No staff members found.";
        } else {
            noUsersMsg.classList.add("hidden");

            filteredUsers.forEach(user => {
                const tr = document.createElement("tr");
                tr.className = "hover:bg-red-50 transition border-b cursor-pointer group"; // Added cursor-pointer

                // Row Click opens Action Modal
                tr.onclick = (e) => {
                    if (e.target.closest("button")) return; // Don't trigger if clicking explicit buttons
                    openActionModal(user);
                };

                // Status Badge
                const statusStr = user.status || "Active";
                let statusClass = "bg-green-100 text-green-800";
                if (statusStr === "On Leave") statusClass = "bg-yellow-100 text-yellow-800";
                if (statusStr === "Suspended") statusClass = "bg-red-100 text-red-800";

                // Simulated Module Data
                const taskCount = Math.floor(Math.random() * 5);
                const reportCount = Math.floor(Math.random() * 3);
                const lastActivity = "Today, 10:45 AM";

                tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mr-3 border border-red-100">
                        <i class="fas fa-id-badge"></i>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500 font-medium">${user.role}</div>
                      </div>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusStr}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                   <div class="flex items-center">
                      <span class="font-bold mr-1">${taskCount}</span> Tasks
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    ${reportCount > 0 ? `<span class="text-red-600 font-bold">${reportCount} Pending</span>` : `<span class="text-green-600 italic">None</span>`}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic">
                   ${lastActivity}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button class="text-blue-600 hover:text-blue-900 edit-btn bg-blue-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Edit Profile"><i class="fas fa-user-edit"></i></button>
                    <button class="text-purple-600 hover:text-purple-900 task-btn bg-purple-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Assign Task"><i class="fas fa-tasks"></i></button>
                    <button class="text-orange-600 hover:text-orange-900 report-btn bg-orange-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Review Reports"><i class="fas fa-file-signature"></i></button>
                    <button class="text-red-600 hover:text-red-900 query-btn bg-red-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Issue Query"><i class="fas fa-question-circle"></i></button>
                </td>
            `;
                tableBody.appendChild(tr);
            });
        }
    }

    // === Modal Logic ===
    function openModal(isEdit = false, userData = null) {
        modalOverlay.classList.remove("hidden");

        // Explicitly set type to staff silently
        if (accountTypeSelector) accountTypeSelector.value = "staff";

        // Manage Permissions on Role
        const roleSelect = inputs.staffRole;
        if (roleSelect && !isGlobalAdmin) {
            for (let i = 0; i < roleSelect.options.length; i++) {
                if (roleSelect.options[i].value === 'Admin') roleSelect.options[i].style.display = "none";
            }
        }

        // Lock Branch
        if (!isGlobalAdmin) {
            if (inputs.staffBranch) {
                inputs.staffBranch.value = currentUser.branch;
                inputs.staffBranch.disabled = true;
            }
        } else {
            if (inputs.staffBranch) inputs.staffBranch.disabled = false;
        }

        // --- Role-Based Field Access ---
        // If editing and NOT a Global Admin, restrict fields
        const isRestrictedEdit = isEdit && !isGlobalAdmin;

        // Fields to restrict
        const restrictedFields = [
            inputs.staffName,
            inputs.staffEmail,
            inputs.staffPhone,
            inputs.staffId,
            inputs.staffRole,
            inputs.staffBranch,
            inputs.staffPicture,
            inputs.staffDropbox
        ];

        restrictedFields.forEach(field => {
            if (field) {
                field.disabled = isRestrictedEdit;
                // Add a visual cue for disabled fields
                if (isRestrictedEdit) {
                    field.classList.add("bg-gray-100", "cursor-not-allowed");
                } else {
                    field.classList.remove("bg-gray-100", "cursor-not-allowed");
                }
            }
        });

        // Always ensure Status and Notes are enabled
        if (inputs.status) inputs.status.disabled = false;
        if (inputs.notes) inputs.notes.disabled = false;

        if (isEdit && userData) {
            modalTitle.textContent = "Edit Staff";
            inputs.id.value = userData.id;
            inputs.status.value = userData.status || "Active";
            inputs.notes.value = userData.notes || "";
            inputs.staffName.value = userData.name;
            inputs.staffEmail.value = userData.email;
            inputs.staffRole.value = userData.role;
            inputs.staffBranch.value = userData.branch;
            inputs.staffPhone.value = userData.secondaryInfo;
            if (inputs.staffDropbox) inputs.staffDropbox.value = userData.dropboxLink || "";
            // Picture is file input, can't set value, but could show preview if we had an <img> tag

        } else {
            modalTitle.textContent = "Add New Staff";
            userForm.reset();
            inputs.id.value = "";
            if (!isGlobalAdmin && inputs.staffBranch) inputs.staffBranch.value = currentUser.branch;
        }
    }

    function closeModal() {
        modalOverlay.classList.add("hidden");
    }

    // --- Action Modal Logic ---
    let activeActionUser = null;

    function openActionModal(user) {
        if (!user) return;
        activeActionUser = user;
        if (actionStaffName) actionStaffName.textContent = user.name;
        if (actionStaffRole) actionStaffRole.textContent = user.role;
        if (actionModalOverlay) actionModalOverlay.classList.remove("hidden");
    }

    function closeActionModal() {
        if (actionModalOverlay) actionModalOverlay.classList.add("hidden");
        activeActionUser = null;
    }

    // === Event Listeners ===
    if (searchInput) searchInput.addEventListener("input", renderTable);
    if (branchFilter) branchFilter.addEventListener("change", renderTable);
    if (deptFilter) deptFilter.addEventListener("change", renderTable);
    if (statusFilter) statusFilter.addEventListener("change", renderTable);

    addUserBtn.addEventListener("click", () => openModal(false));
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

    // Form Submit
    userForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = {
            type: 'staff',
            id: inputs.id.value,
            status: inputs.status.value,
            notes: inputs.notes.value,
            name: inputs.staffName.value,
            email: inputs.staffEmail.value,
            role: inputs.staffRole.value,
            branch: !isGlobalAdmin ? currentUser.branch : inputs.staffBranch.value,
            secondaryInfo: inputs.staffPhone.value,
            dropboxLink: inputs.staffDropbox ? inputs.staffDropbox.value : ""
            // Picture handling would involve FileReader or upload logic, for now we log it
        };

        if (inputs.staffPicture && inputs.staffPicture.files[0]) {
            console.log("Picture selected:", inputs.staffPicture.files[0].name);
            data.profilePicture = inputs.staffPicture.files[0].name; // Mock persistence
        }

        if (data.id) {
            window.UserService.updateUser(data.id, data);
            alert("Staff updated successfully!");
        } else {
            window.UserService.addUser(data);
            alert("Staff added successfully!");
        }
        closeModal();
        renderTable();
    });

    // Table Actions (Legacy / Supporting specific clicks)
    tableBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        const user = window.UserService.getAllUsers().find(u => u.id == id);
        if (!user) return;

        if (btn.classList.contains("edit-btn")) {
            openModal(true, user);
        }
        if (btn.classList.contains("task-btn")) {
            triggerAssignTask(user);
        }
        if (btn.classList.contains("report-btn")) {
            triggerReviewReports(user);
        }
        if (btn.classList.contains("query-btn")) {
            triggerIssueQuery(user);
        }
    });

    // Action Modal Button Handlers
    if (closeActionModalBtn) closeActionModalBtn.onclick = closeActionModal;
    if (actionModalOverlay) actionModalOverlay.onclick = (e) => { if (e.target === actionModalOverlay) closeActionModal(); };

    if (btnAssignTask) btnAssignTask.onclick = () => { triggerAssignTask(activeActionUser); closeActionModal(); };
    if (btnReviewReports) btnReviewReports.onclick = () => { triggerReviewReports(activeActionUser); closeActionModal(); };
    if (btnIssueQuery) btnIssueQuery.onclick = () => { triggerIssueQuery(activeActionUser); closeActionModal(); };
    if (btnEditProfile) btnEditProfile.onclick = () => { openModal(true, activeActionUser); closeActionModal(); };

    // Action Triggers
    function triggerAssignTask(user) {
        alert(`📝 Task Assignment for ${user ? user.name : "Staff"}\nTargeting: ${user ? user.branch : 'Branch'}\nFeatures: Job Type, Deadline, Priority, Descriptions\nComing Soon!`);
    }
    function triggerReviewReports(user) {
        alert(`📊 Staff Performance: ${user ? user.name : "Staff"}\nReviewing: Attendance, Jobs Completed, Sales Targets\nComing Soon!`);
    }
    function triggerIssueQuery(user) {
        const reason = prompt(`Issue Official Query to ${user ? user.name : "Staff"}:\nReason:`);
        if (reason) {
            alert("Query issued and logged. Staff will be notified via email.");
        }
    }

    renderTable();
};
