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

    // Modal Elements
    const modalOverlay = document.getElementById("user-modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const userForm = document.getElementById("user-form");
    const addUserBtn = document.getElementById("addUserBtn");
    const closeBtn = document.getElementById("close-user-modal");
    const cancelBtn = document.getElementById("cancel-user-modal");

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
        staffId: document.getElementById("staff-id")
    };

    // === Render Function ===
    function renderTable() {
        let users = window.UserService.getAllUsers();

        // Filter for STAFF only
        users = users.filter(u => u.type !== 'customer' && u.type !== 'dealer');

        // Filter
        const searchTerm = searchInput.value.toLowerCase();

        // Enforce Branch
        let branchTerm = branchFilter.value;
        if (!isGlobalAdmin) {
            branchTerm = currentUser.branch;
            if (branchFilter) {
                branchFilter.value = branchTerm;
                // User requested removal from view
                branchFilter.style.display = "none";
                branchFilter.disabled = true;
            }
        }

        const filteredUsers = users.filter(user => {
            // 1. Branch Restriction
            if (branchTerm && user.branch !== branchTerm) return false;

            // Safe check
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();

            const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm);
            return matchesSearch;
        });

        tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {
            noUsersMsg.classList.remove("hidden");
            noUsersMsg.textContent = "No staff members found.";
        } else {
            noUsersMsg.classList.add("hidden");

            filteredUsers.forEach(user => {
                const tr = document.createElement("tr");
                tr.className = "hover:bg-gray-50 transition";

                // Status Styles
                const statusLower = (user.status || "Active").toLowerCase();
                let statusClass = "bg-green-100 text-green-800";
                if (statusLower !== "active") statusClass = "bg-gray-100 text-gray-800";

                // Role Badge
                let displayBadge = user.role || "Staff";
                let badgeClass = "bg-blue-100 text-blue-700";
                if (displayBadge === 'Admin') badgeClass = "bg-red-100 text-red-700";

                tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        <i class="fas fa-id-badge"></i>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500">${user.role}</div>
                      </div>
                   </div>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}">
                        ${displayBadge}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="text-sm text-gray-900">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.branch || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${user.status || 'Active'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                    <button class="text-blue-600 hover:text-blue-900 edit-btn" data-id="${user.id}" title="Edit Profile"><i class="fas fa-edit"></i></button>
                    ${!isGlobalAdmin ?
                        `<button class="text-purple-600 hover:text-purple-900 task-btn" data-id="${user.id}" title="Assign Task"><i class="fas fa-tasks"></i></button>`
                        : ''}
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

    // === Event Listeners ===
    searchInput.addEventListener("input", renderTable);
    branchFilter.addEventListener("change", renderTable);
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
            secondaryInfo: inputs.staffPhone.value
        };

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

    // Table Actions
    tableBody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains("edit-btn")) {
            const user = window.UserService.getAllUsers().find(u => u.id == id);
            if (user) openModal(true, user);
        }

        if (btn.classList.contains("task-btn")) {
            alert("Task Assignment Mode for " + id + " (Coming Soon)");
            // Future: Open task assignment modal
        }
    });

    renderTable();
};
