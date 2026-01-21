window.initManageCustomers = function () {
    console.log("Manage Customers initialized");

    // Check Auth & Permissions
    const currentUser = {
        role: localStorage.getItem("staffType"),
        branch: localStorage.getItem("branch"),
        isAdmin: window.AuthService.getRole() === 'admin'
    };
    const isGlobalAdmin = currentUser.isAdmin || (currentUser.role && currentUser.role.toUpperCase() === 'ADMIN');

    if (!window.UserService.can(currentUser, "view_branch_users") && !isGlobalAdmin) {
        // Managers usually have permission to view their branch clients
        document.getElementById("dashboard-container").innerHTML = "<div class='p-10 text-red-600'>Access Denied.</div>";
        return;
    }

    // Update Title
    const pageTitle = document.querySelector("#dashboard-container h2");
    if (pageTitle) pageTitle.textContent = "Branch Customer Management";

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

    // Type Selector - We will toggle between Customer and Dealer only
    const accountTypeSelector = document.getElementById("account-type-selector");
    if (accountTypeSelector) {
        // Remove 'staff' option if possible or just hide it
        // For simplicity, let's keep logic simple: show selector but hide 'Staff' option
        for (let opt of accountTypeSelector.options) {
            if (opt.value === 'staff') opt.style.display = 'none';
        }
        if (accountTypeSelector.value === 'staff') accountTypeSelector.value = 'customer';
    }

    // Sections
    const sectionStaff = document.getElementById("form-section-staff");
    const sectionDealer = document.getElementById("form-section-dealer");
    const sectionCustomer = document.getElementById("form-section-customer");

    // Input Fields
    const inputs = {
        id: document.getElementById("user-id"),
        status: document.getElementById("common-status"),
        notes: document.getElementById("common-notes"),
        // Dealer
        dealerCompany: document.getElementById("dealer-company"),
        dealerBranch: document.getElementById("dealer-branch"),
        dealerContact: document.getElementById("dealer-contact-name"),
        dealerEmail: document.getElementById("dealer-email"),
        dealerServiceType: document.getElementById("dealer-service-type"),
        // Customer
        customerCompany: document.getElementById("customer-company"),
        customerBranch: document.getElementById("customer-branch"),
        customerContact: document.getElementById("customer-contact-name"),
        customerEmail: document.getElementById("customer-email"),
        customerType: document.getElementById("customer-type"),
    };

    function updateFormVisibility() {
        const type = accountTypeSelector ? accountTypeSelector.value : 'customer';
        if (sectionStaff) sectionStaff.classList.add("hidden");
        if (sectionDealer) sectionDealer.classList.add("hidden");
        if (sectionCustomer) sectionCustomer.classList.add("hidden");

        if (type === "dealer") sectionDealer.classList.remove("hidden");
        else sectionCustomer.classList.remove("hidden");
    }

    if (accountTypeSelector) accountTypeSelector.addEventListener("change", updateFormVisibility);

    // === Render Function ===
    function renderTable() {
        let users = window.UserService.getAllUsers();

        // Filter for Customers/Dealers
        users = users.filter(u => u.type === 'customer' || u.type === 'dealer');

        // Filter
        const searchTerm = searchInput.value.toLowerCase();
        let branchTerm = branchFilter.value;
        if (!isGlobalAdmin) {
            branchTerm = currentUser.branch;
            if (branchFilter) {
                branchFilter.value = branchTerm;
                // User requested removal from view
                branchFilter.style.display = "none";
            }
        }

        const filteredUsers = users.filter(user => {
            if (branchTerm && user.branch !== branchTerm) return false;
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(searchTerm) || email.includes(searchTerm);
        });

        tableBody.innerHTML = "";

        if (filteredUsers.length === 0) {
            noUsersMsg.classList.remove("hidden");
            noUsersMsg.textContent = "No customers found.";
        } else {
            noUsersMsg.classList.add("hidden");

            filteredUsers.forEach(user => {
                const tr = document.createElement("tr");
                tr.className = "hover:bg-gray-50 transition";

                let icon = "fa-building";
                if (user.type === 'dealer') icon = "fa-handshake";

                tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        <i class="fas ${icon}"></i>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500 uppercase">${user.type}</div>
                      </div>
                   </div>
                </td>
                 <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        ${user.displayRole || user.type}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="text-sm text-gray-900">${user.email}</div>
                   <div class="text-xs text-gray-500">${user.secondaryInfo || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.branch || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${user.status || 'Active'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                    <button class="text-blue-600 hover:text-blue-900 edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                    ${!isGlobalAdmin ? `<button class="text-green-600 hover:text-green-900 sales-btn" data-id="${user.id}" title="Assign to Sales"><i class="fas fa-user-tag"></i></button>` : ''}
                </td>
            `;
                tableBody.appendChild(tr);
            });
        }
    }

    // === Modal Logic ===
    function openModal(isEdit = false, userData = null) {
        modalOverlay.classList.remove("hidden");

        // Lock Branch
        if (!isGlobalAdmin) {
            if (inputs.customerBranch) { inputs.customerBranch.value = currentUser.branch; inputs.customerBranch.disabled = true; }
            if (inputs.dealerBranch) { inputs.dealerBranch.value = currentUser.branch; inputs.dealerBranch.disabled = true; }
        } else {
            if (inputs.customerBranch) inputs.customerBranch.disabled = false;
            if (inputs.dealerBranch) inputs.dealerBranch.disabled = false;
        }

        if (isEdit && userData) {
            modalTitle.textContent = "Edit Client";
            if (accountTypeSelector) {
                accountTypeSelector.value = userData.type;
                accountTypeSelector.disabled = true;
            }
            inputs.id.value = userData.id;
            inputs.status.value = userData.status || "Active";
            inputs.notes.value = userData.notes || "";

            updateFormVisibility();

            if (userData.type === "dealer") {
                inputs.dealerCompany.value = userData.name;
                inputs.dealerContact.value = userData.contactPerson;
                inputs.dealerEmail.value = userData.email;
                inputs.dealerBranch.value = userData.branch;
                inputs.dealerServiceType.value = userData.displayRole;
            } else {
                inputs.customerCompany.value = userData.name;
                inputs.customerContact.value = userData.contactPerson;
                inputs.customerEmail.value = userData.email;
                inputs.customerBranch.value = userData.branch;
                inputs.customerType.value = userData.displayRole;
            }

        } else {
            modalTitle.textContent = "Add New Client";
            userForm.reset();
            if (accountTypeSelector) {
                accountTypeSelector.disabled = false;
                accountTypeSelector.value = "customer";
            }
            updateFormVisibility();
            inputs.id.value = "";

            if (!isGlobalAdmin) {
                if (inputs.dealerBranch) inputs.dealerBranch.value = currentUser.branch;
                if (inputs.customerBranch) inputs.customerBranch.value = currentUser.branch;
            }
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
        const type = accountTypeSelector ? accountTypeSelector.value : 'customer';

        let data = { type, status: inputs.status.value, notes: inputs.notes.value, id: inputs.id.value };

        if (type === "dealer") {
            data.name = inputs.dealerCompany.value;
            data.contactPerson = inputs.dealerContact.value;
            data.email = inputs.dealerEmail.value;
            data.branch = !isGlobalAdmin ? currentUser.branch : inputs.dealerBranch.value;
            data.role = "Dealer";
            data.displayRole = inputs.dealerServiceType.value;
            data.secondaryInfo = data.contactPerson;
        } else {
            data.name = inputs.customerCompany.value;
            data.contactPerson = inputs.customerContact.value;
            data.email = inputs.customerEmail.value;
            data.branch = !isGlobalAdmin ? currentUser.branch : inputs.customerBranch.value;
            data.role = "Customer";
            data.displayRole = inputs.customerType.value;
            data.secondaryInfo = data.contactPerson;
        }

        if (data.id) {
            window.UserService.updateUser(data.id, data);
            alert("Client updated successfully!");
        } else {
            window.UserService.addUser(data);
            alert("Client added successfully!");
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

        if (btn.classList.contains("sales-btn")) {
            alert("Assign to Sales Staff for " + id + " (Coming Soon)");
        }
    });

    renderTable();
};
