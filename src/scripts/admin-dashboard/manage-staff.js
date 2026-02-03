window.initManageStaff = async function () {
    console.log("Manage Staff initialized");

    // Check Auth & Permissions
    const currentUser = {
        role: localStorage.getItem("staffType"),
        branch: localStorage.getItem("branch"),
        isAdmin: window.AuthService.getRole() === 'admin'
    };
    const isGlobalAdmin = currentUser.isAdmin || (currentUser.role && currentUser.role.toUpperCase() === 'ADMIN');
    const isManager = currentUser.role && currentUser.role.toUpperCase() === 'MANAGER';
    const canSeeAll = isGlobalAdmin || isManager;

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

    // Task Modal Elements
    const taskModalOverlay = document.getElementById("task-modal-overlay");
    const taskForm = document.getElementById("task-form");
    const closeTaskBtn = document.getElementById("close-task-modal");
    const cancelTaskBtn = document.getElementById("cancel-task-modal");
    const taskStaffIdInput = document.getElementById("task-staff-id");

    // Query Modal Elements
    const queryModalOverlay = document.getElementById("query-modal-overlay");
    const queryForm = document.getElementById("query-form");
    const closeQueryBtn = document.getElementById("close-query-modal");
    const cancelQueryBtn = document.getElementById("cancel-query-modal");
    const queryStaffIdInput = document.getElementById("query-staff-id");

    // Review Reports Modal Elements
    const reviewModalOverlay = document.getElementById("review-reports-modal-overlay");
    const closeReviewBtn = document.getElementById("close-review-modal");
    const closeReviewBtnBottom = document.getElementById("close-review-btn");
    const reviewStaffName = document.getElementById("review-reports-staff-name");
    const staffActivityList = document.getElementById("staff-activity-list");

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

    // === Dynamic Data Loading ===
    const branches = await window.UserService.getBranches();

    // Populate Filters
    if (branchFilter) {
        branchFilter.innerHTML = '<option value="">All Branches</option>';
        branches.forEach(b => {
            branchFilter.innerHTML += `<option value="${b.name}">${b.name}</option>`; // Keep name for filtering logic
        });
    }

    // Populate Modal Branch Selection
    const staffBranchSelect = document.getElementById("staff-branch");
    if (staffBranchSelect) {
        staffBranchSelect.innerHTML = '<option value="">Select Branch</option>';
        branches.forEach(b => {
            staffBranchSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`; // Use ID for saving
        });
    }

    // Input Fields
    const inputs = {
        id: document.getElementById("user-id"),
        status: document.getElementById("common-status"),
        password: document.getElementById("common-password"),
        notes: document.getElementById("common-notes"),
        staffName: document.getElementById("staff-name"),
        staffEmail: document.getElementById("staff-email"),
        staffPhone: document.getElementById("staff-phone"),
        staffRole: document.getElementById("staff-role"),
        staffBranch: staffBranchSelect,
        staffId: document.getElementById("staff-id"),
        staffPicture: document.getElementById("staff-picture"),
        staffDropbox: document.getElementById("staff-dropbox")
    };

    // === Sorting Logic ===
    let sortConfig = { key: null, direction: 'asc' };

    function sortData(data) {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            let valA = a[sortConfig.key] || "";
            let valB = b[sortConfig.key] || "";
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // === Render Function ===
    async function renderTable() {
        let users = await window.UserService.getAllUsers();
        console.log("🔍 UserService.getAllUsers() returned:", users);

        // Filter for STAFF only
        users = users.filter(u => String(u.type).toLowerCase() === 'staff');
        console.log(`🔍 After staff filter: ${users.length} users left`);

        // Apply Sorting
        users = sortData(users);

        // Filters
        const searchTerm = (searchInput.value || "").toLowerCase();
        const deptTerm = deptFilter ? deptFilter.value : "";
        const statusTerm = statusFilter ? statusFilter.value : "";

        // Enforce Branch
        let branchTerm = branchFilter ? branchFilter.value : "";
        if (!canSeeAll) {
            branchTerm = currentUser.branch;
            if (branchFilter) {
                branchFilter.value = branchTerm;
                branchFilter.style.display = "none";
                branchFilter.parentElement.style.display = "none";
            }
        }

        console.log(`🔍 Filtering by: Branch="${branchTerm}", Dept="${deptTerm}", Status="${statusTerm}", Search="${searchTerm}"`);

        const filteredUsers = users.filter(user => {
            // 1. Branch Restriction (Case-insensitive)
            if (branchTerm && String(user.branch).toLowerCase() !== String(branchTerm).toLowerCase()) {
                return false;
            }

            // 2. Department/Role Filter (Case-insensitive)
            if (deptTerm) {
                const uRole = String(user.role).toLowerCase();
                const dTerm = String(deptTerm).toLowerCase();
                if (uRole !== dTerm) {
                    if (!(dTerm === 'logistics' && (uRole === 'driver' || uRole === 'logistics'))) return false;
                }
            }

            // 3. Status Filter (Case-insensitive)
            if (statusTerm && String(user.status || "Active").toLowerCase() !== String(statusTerm).toLowerCase()) {
                return false;
            }

            // 4. Search
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(searchTerm) || email.includes(searchTerm);
        });

        console.log(`🔍 Final filtered users: ${filteredUsers.length}`);

        tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {
            noUsersMsg.classList.remove("hidden");
            noUsersMsg.textContent = "No staff members matching your criteria were found.";
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    ${user.branch || '-'}
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
            if (inputs.password) inputs.password.value = "";
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

    // Sorting
    const sortBranchHeader = document.getElementById("sort-branch-header");
    if (sortBranchHeader) {
        sortBranchHeader.addEventListener("click", () => {
            if (sortConfig.key === 'branch') {
                sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortConfig.key = 'branch';
                sortConfig.direction = 'asc';
            }
            // Update icon
            const icon = sortBranchHeader.querySelector("i");
            if (icon) {
                icon.className = `fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ml-1 text-red-600`;
            }
            renderTable();
        });
    }

    addUserBtn.addEventListener("click", () => openModal(false));
    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

    // Form Submit
    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            type: 'staff',
            id: inputs.id.value,
            status: inputs.status.value,
            notes: inputs.notes.value,
            name: inputs.staffName.value,
            email: inputs.staffEmail.value,
            role: inputs.staffRole.value,
            branchId: inputs.staffBranch.value, // Send ID
            secondaryInfo: inputs.staffPhone.value,
            dropboxLink: inputs.staffDropbox ? inputs.staffDropbox.value : ""
        };

        if (inputs.password && inputs.password.value) {
            data.password = inputs.password.value;
        }

        if (inputs.staffPicture && inputs.staffPicture.files[0]) {
            console.log("Picture selected:", inputs.staffPicture.files[0].name);
            data.profilePicture = inputs.staffPicture.files[0].name; // Mock persistence
        }

        if (data.id) {
            await window.UserService.updateUser(data.id, data);
            window.ToastService.success("Staff updated successfully!");
        } else {
            await window.UserService.addUser(data);
            window.ToastService.success("Staff added successfully!");
        }
        closeModal();
        await renderTable();
    });

    // Table Actions (Legacy / Supporting specific clicks)
    tableBody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        const users = await window.UserService.getAllUsers();
        const user = users.find(u => u.id == id);
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
        if (!user) return;
        taskStaffIdInput.value = user.id;
        document.querySelector("#task-modal-overlay h3").textContent = `Assign Task to ${user.name}`;
        taskModalOverlay.classList.remove("hidden");
    }

    if (btnReviewReports) {
        btnReviewReports.addEventListener("click", () => {
            if (!activeActionUser) return;
            openReviewReportsModal(activeActionUser);
        });
    }

    if (btnIssueQuery) {
        btnIssueQuery.addEventListener("click", () => {
            if (!activeActionUser) return;
            openQueryModal(activeActionUser);
        });
    }

    // === Review Reports Logic ===
    function openReviewReportsModal(user) {
        closeActionModal();
        reviewModalOverlay.classList.remove("hidden");
        reviewStaffName.textContent = `Activity Log: ${user.name} (${user.role})`;

        // Fetch & Render Activities
        staffActivityList.innerHTML = '<div class="text-center text-gray-400 mt-10"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Loading records...</p></div>';

        setTimeout(() => {
            const logs = window.ReportService.getActivityLog(); // In real app, pass user.id
            // Mock Filter: Show logs relevant to this user or general logs if none specific
            // For now, allow all logs but add a "dummy" specific one

            const specificLogs = [
                { date: new Date().toISOString().split('T')[0], type: 'System', text: `User ${user.name} logged in`, branch: user.branch },
                ...logs
            ];

            if (specificLogs.length === 0) {
                staffActivityList.innerHTML = '<p class="text-center text-gray-500 mt-10">No recent activity found.</p>';
            } else {
                staffActivityList.innerHTML = '';
                specificLogs.forEach(log => {
                    const icon = log.type === 'Service' ? 'fa-tools text-blue-500' : 'fa-info-circle text-gray-400';
                    const bgClass = log.type === 'Service' ? 'bg-blue-50' : 'bg-gray-50';

                    staffActivityList.innerHTML += `
                        <div class="flex gap-4 mb-4 p-3 rounded-lg ${bgClass} border border-gray-100">
                            <div class="mt-1"><i class="fas ${icon}"></i></div>
                            <div>
                                <div class="text-xs text-gray-400 font-mono">${log.date} • ${log.branch || 'General'}</div>
                                <div class="text-sm text-gray-800 font-medium">${log.text}</div>
                            </div>
                        </div>
                    `;
                });
            }
        }, 500); // Simulate network delay
    }

    function closeReviewModal() {
        reviewModalOverlay.classList.add("hidden");
    }

    if (closeReviewBtn) closeReviewBtn.onclick = closeReviewModal;
    if (closeReviewBtnBottom) closeReviewBtnBottom.onclick = closeReviewModal;

    function triggerReviewReports(user) {
        window.ToastService.info(`📊 Staff Performance: ${user ? user.name : "Staff"} - Coming Soon!`);
    }

    function triggerIssueQuery(user) {
        if (!user) return;
        queryStaffIdInput.value = user.id;
        document.querySelector("#query-modal-overlay h3").textContent = `Query for ${user.name}`;
        queryModalOverlay.classList.remove("hidden");
    }

    // Modal Close Handlers
    const closeTaskModal = () => taskModalOverlay.classList.add("hidden");
    if (closeTaskBtn) closeTaskBtn.onclick = closeTaskModal;
    if (cancelTaskBtn) cancelTaskBtn.onclick = closeTaskModal;

    const closeQueryModal = () => queryModalOverlay.classList.add("hidden");
    if (closeQueryBtn) closeQueryBtn.onclick = closeQueryModal;
    if (cancelQueryBtn) cancelQueryBtn.onclick = closeQueryModal;

    // Form Submissions
    if (taskForm) {
        taskForm.onsubmit = async (e) => {
            e.preventDefault();
            const taskData = {
                staffId: taskStaffIdInput.value,
                title: document.getElementById("task-title").value,
                description: document.getElementById("task-desc").value,
                priority: document.getElementById("task-priority").value,
                dueDate: document.getElementById("task-due-date").value,
                assignedBy: localStorage.getItem("userId") || 1
            };

            const res = await window.AdminToolService.assignTask(taskData);
            if (!res.error) {
                window.ToastService.success(`Task assigned to ${activeActionUser ? activeActionUser.name : 'Staff'}!`);
                closeTaskModal();
                taskForm.reset();
            } else {
                window.ToastService.error("Failed to assign task.");
            }
        };
    }

    if (queryForm) {
        queryForm.onsubmit = async (e) => {
            e.preventDefault();
            const queryData = {
                staffId: queryStaffIdInput.value,
                title: document.getElementById("query-title").value,
                reason: document.getElementById("query-reason").value,
                issuedBy: localStorage.getItem("userId") || 1
            };

            const res = await window.AdminToolService.issueQuery(queryData);
            if (!res.error) {
                window.ToastService.success(`Official Query issued to ${activeActionUser ? activeActionUser.name : 'Staff'}.`);
                closeQueryModal();
                queryForm.reset();
            } else {
                window.ToastService.error("Failed to issue query.");
            }
        };
    }

    renderTable();
};
