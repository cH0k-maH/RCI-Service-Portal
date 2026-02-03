window.initManageCustomers = async function () {
    console.log("Manage Customers initialized");

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
    if (pageTitle) pageTitle.textContent = "Branch Customer Management";

    // === Dynamic Data Loading ===
    const branches = await window.UserService.getBranches();

    // === UI Elements ===
    const tableBody = document.getElementById("users-table-body");
    const noUsersMsg = document.getElementById("no-users-msg");
    const searchInput = document.getElementById("user-search");
    const branchFilter = document.getElementById("branch-filter");

    // Populate Filters
    if (branchFilter) {
        branchFilter.innerHTML = '<option value="">All Branches</option>';
        branches.forEach(b => {
            branchFilter.innerHTML += `<option value="${b.name}">${b.name}</option>`;
        });
    }

    // Modal Elements
    const modalOverlay = document.getElementById("user-modal-overlay");
    const modalTitle = document.getElementById("modal-title");
    const userForm = document.getElementById("user-form");
    const addUserBtn = document.getElementById("addUserBtn");
    const closeBtn = document.getElementById("close-user-modal");
    const cancelBtn = document.getElementById("cancel-user-modal");

    // Action Modal Elements
    const actionModalOverlay = document.getElementById("customer-action-modal-overlay");
    const actionCustomerName = document.getElementById("action-customer-name");
    const actionCustomerType = document.getElementById("action-customer-type");
    const closeActionModalBtn = document.getElementById("close-customer-action-modal");

    const btnServiceHistory = document.getElementById("btn-service-history");
    const btnLogComplaint = document.getElementById("btn-log-complaint");
    const btnAssignSales = document.getElementById("btn-assign-sales");
    const btnEditProfile = document.getElementById("btn-edit-customer-profile");

    // Complaint Modal Elements
    const complaintModalOverlay = document.getElementById("complaint-modal-overlay");
    const complaintForm = document.getElementById("complaint-form");
    const closeComplaintBtn = document.getElementById("close-complaint-modal");
    const cancelComplaintBtn = document.getElementById("cancel-complaint-modal");
    const complaintClientIdInput = document.getElementById("complaint-client-id");

    // History Modal Elements
    const historyModalOverlay = document.getElementById("history-modal-overlay");
    const closeHistoryBtn = document.getElementById("close-history-modal");
    const closeHistoryBtnBottom = document.getElementById("close-history-btn");
    const historyList = document.getElementById("history-list");
    const historyClientName = document.getElementById("history-client-name");

    // Assign Sales Modal Elements
    const assignSalesModal = document.getElementById("assign-sales-modal-overlay");
    const closeAssignSalesBtn = document.getElementById("close-assign-sales-modal");
    const cancelAssignSalesBtn = document.getElementById("cancel-assign-sales-modal");
    const assignSalesForm = document.getElementById("assign-sales-form");
    const assignSalesSelect = document.getElementById("assign-sales-select");
    const assignSalesClientName = document.getElementById("assign-sales-client-name");
    const assignSalesClientId = document.getElementById("assign-sales-client-id");

    // Admin-Only: Add Client Button
    if (addUserBtn && !isGlobalAdmin) {
        addUserBtn.style.display = 'none';
    }

    // Populate Modal Dropdowns
    const dealerBranchSelect = document.getElementById("dealer-branch");
    const customerBranchSelect = document.getElementById("customer-branch");

    if (dealerBranchSelect) {
        dealerBranchSelect.innerHTML = '<option value="">Select Branch</option>';
        branches.forEach(b => dealerBranchSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    }
    if (customerBranchSelect) {
        customerBranchSelect.innerHTML = '<option value="">Select Branch</option>';
        branches.forEach(b => customerBranchSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    }

    // Input Fields (Rest of the code continues...)
    const inputs = {
        id: document.getElementById("user-id"),
        status: document.getElementById("common-status"),
        password: document.getElementById("common-password"),
        notes: document.getElementById("common-notes"),
        // Dealer
        dealerCompany: document.getElementById("dealer-company"),
        dealerBranch: dealerBranchSelect,
        dealerContact: document.getElementById("dealer-contact-name"),
        dealerEmail: document.getElementById("dealer-email"),
        dealerServiceType: document.getElementById("dealer-service-type"),
        // Customer
        customerCompany: document.getElementById("customer-company"),
        customerBranch: customerBranchSelect,
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
        console.log("Fetched users for table:", users);

        // Filter for Customers/Dealers
        users = users.filter(u => u.type === 'customer' || u.type === 'dealer');

        // Apply Sorting
        users = sortData(users);

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
            if (branchTerm && String(user.branch).toLowerCase() !== String(branchTerm).toLowerCase()) return false;
            const name = (user.name || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(searchTerm) || email.includes(searchTerm);
        });

        console.log(`🔍 Final filtered customers: ${filteredUsers.length}`);

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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    ${user.branch || '-'}
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
            if (inputs.password) inputs.password.value = "";

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
    if (branchFilter) branchFilter.addEventListener("change", renderTable);

    // Sorting
    const sortBranchHeader = document.getElementById("sort-branch-header");
    // === Assign Sales Logic ===
    window.openAssignSalesModal = async (user) => {
        closeCustomerActionModal();
        assignSalesModal.classList.remove("hidden");
        assignSalesClientName.value = user.name;
        assignSalesClientId.value = user.id;

        // Populate Sales Reps
        assignSalesSelect.innerHTML = '<option value="">Loading...</option>';
        const allUsers = await window.UserService.getAllUsers();
        // Assuming strict role 'sales' or filtering staff
        const salesReps = allUsers.filter(u => (u.role && u.role.toLowerCase() === 'sales') || (u.department && u.department.toLowerCase() === 'sales'));

        assignSalesSelect.innerHTML = '<option value="">Choose a Sales Representative...</option>';
        salesReps.forEach(rep => {
            const selected = (user.sales_rep_id == rep.id) ? 'selected' : '';
            assignSalesSelect.innerHTML += `<option value="${rep.id}" ${selected}>${rep.name}</option>`;
        });
    };

    function closeAssignSalesModal() {
        assignSalesModal.classList.add("hidden");
    }

    if (closeAssignSalesBtn) closeAssignSalesBtn.onclick = closeAssignSalesModal;
    if (cancelAssignSalesBtn) cancelAssignSalesBtn.onclick = closeAssignSalesModal;

    if (assignSalesForm) {
        assignSalesForm.onsubmit = async (e) => {
            e.preventDefault();
            const clientId = assignSalesClientId.value;
            const salesRepId = assignSalesSelect.value;
            const salesRepName = assignSalesSelect.options[assignSalesSelect.selectedIndex].text;

            if (!salesRepId) {
                window.ToastService.error("Please select a sales representative.");
                return;
            }

            // Update User via UserService (mock update)
            const res = await window.UserService.updateUser(clientId, { sales_rep_id: salesRepId, sales_rep_name: salesRepName });

            if (res) { // UserService.updateUser returns result or false
                window.ToastService.success(`Assigned to ${salesRepName}`);
                closeAssignSalesModal();
                renderTable(); // Refresh
            } else {
                window.ToastService.error("Failed to assign sales rep.");
            }
        };
    }

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
        const type = accountTypeSelector ? accountTypeSelector.value : 'customer';

        let data = { type, status: inputs.status.value, notes: inputs.notes.value, id: inputs.id.value };

        if (type === "dealer") {
            data.name = inputs.dealerCompany.value;
            data.contactPerson = inputs.dealerContact.value;
            data.email = inputs.dealerEmail.value;
            data.branchId = inputs.dealerBranch.value; // Send ID
            data.role = "Dealer";
            data.displayRole = inputs.dealerServiceType.value;
            data.secondaryInfo = data.contactPerson;
        } else {
            data.name = inputs.customerCompany.value;
            data.contactPerson = inputs.customerContact.value;
            data.email = inputs.customerEmail.value;
            data.branchId = inputs.customerBranch.value; // Send ID
            data.role = "Customer";
            data.displayRole = inputs.customerType.value;
            data.secondaryInfo = data.contactPerson;
            data.dropboxLink = inputs.customerDropbox ? inputs.customerDropbox.value : "";
        }

        if (inputs.password && inputs.password.value) {
            data.password = inputs.password.value;
        }

        if (inputs.customerPicture && inputs.customerPicture.files[0]) {
            console.log("Customer Picture selected:", inputs.customerPicture.files[0].name);
            data.profilePicture = inputs.customerPicture.files[0].name;
        }

        if (data.id) {
            await window.UserService.updateUser(data.id, data);
            window.ToastService.success("Client updated successfully!");
        } else {
            await window.UserService.addUser(data);
            window.ToastService.success("Client added successfully!");
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
    async function triggerServiceHistory(user) {
        if (!user) return;
        historyClientName.textContent = user.name;
        historyList.innerHTML = `<div class="p-10 text-center"><i class="fas fa-circle-notch fa-spin text-2xl text-red-600"></i></div>`;
        historyModalOverlay.classList.remove("hidden");
        historyModalOverlay.classList.add("flex");

        // Fetch Complaints
        const complaints = await window.AdminToolService.getClientComplaints(user.id);

        // Fetch Service Requests (Existing logic)
        const requests = await window.RequestService.getRequests();
        const clientRequests = requests.filter(r => r.clientId == user.id);

        if (complaints.length === 0 && clientRequests.length === 0) {
            historyList.innerHTML = `<div class="text-center py-10 text-gray-400 italic">No history records found for this client.</div>`;
            return;
        }

        historyList.innerHTML = "";

        // Display Complaints
        complaints.forEach(c => {
            const div = document.createElement("div");
            div.className = "p-4 border border-red-100 bg-red-50/30 rounded-lg";
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <span class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">Complaint</span>
                    <span class="text-[10px] text-gray-400 font-medium">${new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <h4 class="font-bold text-gray-800 mt-1">${c.subject}</h4>
                <p class="text-xs text-gray-600 mt-1">${c.description}</p>
                <div class="mt-2 text-[10px] font-bold text-red-600 uppercase tracking-widest">Status: ${c.status}</div>
            `;
            historyList.appendChild(div);
        });

        // Display Requests
        clientRequests.forEach(r => {
            const div = document.createElement("div");
            div.className = "p-4 border border-blue-100 bg-blue-50/30 rounded-lg";
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Service Request</span>
                    <span class="text-[10px] text-gray-400 font-medium">${r.date || '-'}</span>
                </div>
                <h4 class="font-bold text-gray-800 mt-1">${r.type}</h4>
                <p class="text-xs text-gray-600 mt-1">${r.details || r.description || 'No details provided.'}</p>
                <div class="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">Status: ${r.status}</div>
            `;
            historyList.appendChild(div);
        });
    }

    function triggerLogComplaint(user) {
        if (!user) return;
        complaintClientIdInput.value = user.id;
        document.querySelector("#complaint-modal-overlay h3").textContent = `Log Complaint: ${user.name}`;
        complaintModalOverlay.classList.remove("hidden");
        complaintModalOverlay.classList.add("flex");
    }

    function triggerSalesAssignment(user) {
        window.ToastService.info(`👤 Sales Assignment for ${user ? user.name : "Client"} - Coming Soon!`);
    }

    // Modal Close Handlers
    const closeComplaintModal = () => {
        complaintModalOverlay.classList.add("hidden");
        complaintModalOverlay.classList.remove("flex");
    };
    if (closeComplaintBtn) closeComplaintBtn.onclick = closeComplaintModal;
    if (cancelComplaintBtn) cancelComplaintBtn.onclick = closeComplaintModal;

    const closeHistoryModal = () => {
        historyModalOverlay.classList.add("hidden");
        historyModalOverlay.classList.remove("flex");
    };
    if (closeHistoryBtn) closeHistoryBtn.onclick = closeHistoryModal;
    if (closeHistoryBtnBottom) closeHistoryBtnBottom.onclick = closeHistoryModal;

    // Form Submission
    if (complaintForm) {
        complaintForm.onsubmit = async (e) => {
            e.preventDefault();
            const complaintData = {
                clientId: complaintClientIdInput.value,
                subject: document.getElementById("complaint-subject").value,
                description: document.getElementById("complaint-desc").value,
                loggedBy: localStorage.getItem("userId") || 1
            };

            const res = await window.AdminToolService.logComplaint(complaintData);
            if (!res.error) {
                window.ToastService.success(`Complaint logged for ${activeActionUser ? activeActionUser.name : 'Client'}.`);
                closeComplaintModal();
                complaintForm.reset();
            } else {
                window.ToastService.error("Failed to log complaint.");
            }
        };
    }

    renderTable();
};
