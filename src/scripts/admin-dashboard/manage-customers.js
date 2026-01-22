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

    // Admin-Only: Add Client Button
    if (addUserBtn && !isGlobalAdmin) {
        addUserBtn.style.display = 'none';
    }

    // Action Modal Elements
    const actionModalOverlay = document.getElementById("customer-action-modal-overlay");
    const actionCustomerName = document.getElementById("action-customer-name");
    const actionCustomerType = document.getElementById("action-customer-type");
    const closeActionModalBtn = document.getElementById("close-customer-action-modal");

    const btnServiceHistory = document.getElementById("btn-service-history");
    const btnLogComplaint = document.getElementById("btn-log-complaint");
    const btnAssignSales = document.getElementById("btn-assign-sales");
    const btnEditProfile = document.getElementById("btn-edit-customer-profile");

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
        customerPicture: document.getElementById("customer-picture"),
        customerDropbox: document.getElementById("customer-dropbox")
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
                branchFilter.style.display = "none";
                branchFilter.parentElement.style.display = "none";
            }
        } else {
            // Admin can see the filter
            if (branchFilter) branchFilter.classList.remove("hidden");
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
                tr.className = "hover:bg-red-50 transition border-b cursor-pointer group";

                // Row Click opens Action Modal
                tr.onclick = (e) => {
                    if (e.target.closest("button")) return;
                    openCustomerActionModal(user);
                };

                let icon = "fa-building";
                if (user.type === 'dealer') icon = "fa-handshake";

                // Status Badge
                const statusStr = user.status || "Active";
                let statusClass = "bg-green-100 text-green-800";
                if (statusStr === "Suspended") statusClass = "bg-red-100 text-red-800";

                // Simulated Module Data
                const serviceCount = Math.floor(Math.random() * 4);
                const complaintCount = Math.floor(Math.random() * 2);
                const lastContact = "3 days ago";

                tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mr-3 border border-gray-100">
                        <i class="fas ${icon}"></i>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500 uppercase font-medium">${user.type} • ${user.displayRole || '-'}</div>
                      </div>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusStr}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                   <div class="flex items-center">
                      <i class="fas fa-tools text-gray-400 mr-2"></i>
                      <span>${serviceCount} Active</span>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${complaintCount > 0 ? `<span class="text-red-600 font-bold flex items-center"><i class="fas fa-exclamation-circle mr-1"></i> ${complaintCount} Pending</span>` : `<span class="text-green-600 italic">None</span>`}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 italic">
                   ${lastContact}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button class="text-blue-600 hover:text-blue-900 edit-btn bg-blue-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Edit Profile"><i class="fas fa-user-edit"></i></button>
                    <button class="text-purple-600 hover:text-purple-900 history-btn bg-purple-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Service History"><i class="fas fa-history"></i></button>
                    <button class="text-green-600 hover:text-green-900 sales-btn bg-green-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Assign to Sales"><i class="fas fa-user-tag"></i></button>
                    <button class="text-red-600 hover:text-red-900 complaint-btn bg-red-50 p-2 rounded shadow-sm" data-id="${user.id}" title="Log Complaint"><i class="fas fa-comment-medical"></i></button>
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

        // Hide branch parent for managers in modal
        if (!isGlobalAdmin) {
            if (inputs.customerBranch) inputs.customerBranch.parentElement.style.display = 'none';
            if (inputs.dealerBranch) inputs.dealerBranch.parentElement.style.display = 'none';
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
                if (inputs.customerDropbox) inputs.customerDropbox.value = userData.dropboxLink || "";
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

    // --- Action Modal Logic ---
    let activeActionUser = null;

    function openCustomerActionModal(user) {
        if (!user) return;
        activeActionUser = user;
        if (actionCustomerName) actionCustomerName.textContent = user.name;
        if (actionCustomerType) actionCustomerType.textContent = (user.type || 'Customer').toUpperCase();
        if (actionModalOverlay) actionModalOverlay.classList.remove("hidden");
        if (actionModalOverlay) actionModalOverlay.classList.add("flex");
    }

    function closeCustomerActionModal() {
        if (actionModalOverlay) {
            actionModalOverlay.classList.add("hidden");
            actionModalOverlay.classList.remove("flex");
        }
        activeActionUser = null;
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
            data.dropboxLink = inputs.customerDropbox ? inputs.customerDropbox.value : "";
        }

        if (inputs.customerPicture && inputs.customerPicture.files[0]) {
            console.log("Customer Picture selected:", inputs.customerPicture.files[0].name);
            data.profilePicture = inputs.customerPicture.files[0].name;
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
        if (btn.classList.contains("sales-btn")) {
            triggerSalesAssignment(user);
        }
        if (btn.classList.contains("history-btn")) {
            triggerServiceHistory(user);
        }
        if (btn.classList.contains("complaint-btn")) {
            triggerLogComplaint(user);
        }
    });

    // Action Modal Button Handlers
    if (closeActionModalBtn) closeActionModalBtn.onclick = closeCustomerActionModal;
    if (actionModalOverlay) actionModalOverlay.onclick = (e) => { if (e.target === actionModalOverlay) closeCustomerActionModal(); };

    if (btnServiceHistory) btnServiceHistory.onclick = () => { triggerServiceHistory(activeActionUser); closeCustomerActionModal(); };
    if (btnLogComplaint) btnLogComplaint.onclick = () => { triggerLogComplaint(activeActionUser); closeCustomerActionModal(); };
    if (btnAssignSales) btnAssignSales.onclick = () => { triggerSalesAssignment(activeActionUser); closeCustomerActionModal(); };
    if (btnEditProfile) btnEditProfile.onclick = () => { openModal(true, activeActionUser); closeCustomerActionModal(); };

    // Action Triggers
    function triggerServiceHistory(user) {
        alert(`📜 Service History for ${user ? user.name : "Client"}\n(View all past maintenance, tickets, and installations)\nComing Soon!`);
    }
    function triggerLogComplaint(user) {
        const desc = prompt(`Log New Complaint for ${user ? user.name : "Client"}:\nDescription:`);
        if (desc) {
            alert("Complaint logged. Assigned to Customer Service automatically.");
        }
    }
    function triggerSalesAssignment(user) {
        alert(`👤 Assign ${user ? user.name : "Client"} to Sales Representative\nComing Soon!`);
    }

    renderTable();
};
