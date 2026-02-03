// src/scripts/admin-dashboard/manage-users.js

window.initManageUsers = async function () {
  console.log("Manage Users initialized (Advanced)");

  // Check Auth & Permissions
  const currentUser = {
    role: localStorage.getItem("staffType"),
    branch: localStorage.getItem("branch")
  };

  if (!window.UserService.can(currentUser, "view_all_users")) {
    document.getElementById("dashboard-container").innerHTML = "<div class='p-10 text-red-600'>Access Denied.</div>";
    return;
  }

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

  // Populate Modal Dropdowns
  const staffBranchSelect = document.getElementById("staff-branch");
  const dealerBranchSelect = document.getElementById("dealer-branch");
  const customerBranchSelect = document.getElementById("customer-branch");

  const populate = (sel) => {
    if (sel) {
      sel.innerHTML = '<option value="">Select Branch</option>';
      branches.forEach(b => sel.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    }
  };
  populate(staffBranchSelect);
  populate(dealerBranchSelect);
  populate(customerBranchSelect);

  // Modal Elements
  // ... (rest remains same)
  const modalOverlay = document.getElementById("user-modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const userForm = document.getElementById("user-form");
  const addUserBtn = document.getElementById("addUserBtn");
  const closeBtn = document.getElementById("close-user-modal");
  const cancelBtn = document.getElementById("cancel-user-modal");

  // Dynamic Form Sections
  const accountTypeSelector = document.getElementById("account-type-selector");
  const sectionStaff = document.getElementById("form-section-staff");
  const sectionDealer = document.getElementById("form-section-dealer");
  const sectionCustomer = document.getElementById("form-section-customer");

  // Input Fields (Grouped for easier access)
  const inputs = {
    // Hidden ID
    id: document.getElementById("user-id"),
    // Common
    status: document.getElementById("common-status"),
    password: document.getElementById("common-password"),
    notes: document.getElementById("common-notes"),
    // Staff
    staffName: document.getElementById("staff-name"),
    staffEmail: document.getElementById("staff-email"),
    staffPhone: document.getElementById("staff-phone"),
    staffRole: document.getElementById("staff-role"),
    staffBranch: staffBranchSelect,
    staffId: document.getElementById("staff-id"),
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
  };

  // === Permission Helpers ===
  const isGlobalAdmin = window.AuthService.getRole() === "admin" || (currentUser.role && currentUser.role.toUpperCase() === "ADMIN");
  const userBranch = currentUser.branch;

  // === UI Logic: Dynamic Form Switching ===
  function updateFormVisibility() {
    const type = accountTypeSelector.value;
    sectionStaff.classList.add("hidden");
    sectionDealer.classList.add("hidden");
    sectionCustomer.classList.add("hidden");

    if (type === "staff") sectionStaff.classList.remove("hidden");
    else if (type === "dealer") sectionDealer.classList.remove("hidden");
    else if (type === "customer") sectionCustomer.classList.remove("hidden");
  }

  accountTypeSelector.addEventListener("change", updateFormVisibility);

  // === Logic: Helper to extract data from form based on type ===
  function getFormData() {
    const type = accountTypeSelector.value;
    const status = inputs.status.value;
    const password = inputs.password.value;
    const notes = inputs.notes.value;

    let data = { type, status, notes, id: inputs.id.value };
    if (password) data.password = password;

    if (type === "staff") {
      data.name = inputs.staffName.value;
      data.email = inputs.staffEmail.value;
      data.role = inputs.staffRole.value; // Admin, Engineer, etc.
      data.branchId = inputs.staffBranch.value; // Send ID
      data.secondaryInfo = argsOrEmpty(inputs.staffPhone.value);
      data.displayRole = data.role; // For the badge
    } else if (type === "dealer") {
      data.name = inputs.dealerCompany.value; // Use Company as main name
      data.contactPerson = inputs.dealerContact.value;
      data.email = inputs.dealerEmail.value;
      data.branchId = inputs.dealerBranch.value; // Send ID
      data.role = "Dealer";
      data.displayRole = inputs.dealerServiceType.value; // e.g., Sales Partner
      data.secondaryInfo = data.contactPerson;
    } else if (type === "customer") {
      data.name = inputs.customerCompany.value;
      data.contactPerson = inputs.customerContact.value;
      data.email = inputs.customerEmail.value;
      data.branchId = inputs.customerBranch.value; // Send ID
      data.role = "Customer";
      data.displayRole = inputs.customerType.value; // Corporate / Individual
      data.secondaryInfo = data.contactPerson;
    }
    return data;
  }

  function argsOrEmpty(str) { return str || "-"; }

  // === Render Function ===
  async function renderTable() {
    let users = await window.UserService.getAllUsers();

    // Filter
    const searchTerm = searchInput.value.toLowerCase();
    const branchTerm = branchFilter.value;

    const filteredUsers = users.filter(user => {
      // 1. Branch Restriction (RBAC)
      if (!isGlobalAdmin) {
        if (String(user.branch).toLowerCase() !== String(userBranch).toLowerCase()) return false;
      }

      // Safe check for properties since data structure varies slightly
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const contact = (user.contactPerson || "").toLowerCase();

      const matchesSearch = name.includes(searchTerm) || email.includes(searchTerm) || contact.includes(searchTerm);
      const matchesBranch = branchTerm === "" || String(user.branch).toLowerCase() === String(branchTerm).toLowerCase();
      return matchesSearch && matchesBranch;
    });

    console.log(`🔍 Final filtered users (all): ${filteredUsers.length}`);

    tableBody.innerHTML = "";

    if (filteredUsers.length === 0) {
      noUsersMsg.classList.remove("hidden");
    } else {
      noUsersMsg.classList.add("hidden");

      filteredUsers.forEach(user => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 transition";

        // Status Styles
        const statusLower = (user.status || "Active").toLowerCase();
        let statusClass = "bg-gray-100 text-gray-800";
        if (statusLower === "active") statusClass = "bg-green-100 text-green-800";
        if (statusLower === "suspended" || statusLower === "inactive") statusClass = "bg-red-100 text-red-800";
        if (statusLower === "pending") statusClass = "bg-yellow-100 text-yellow-800";

        // Identity Column (Bold name + Type icon)
        let icon = "fa-user";
        if (user.type === 'dealer') icon = "fa-handshake";
        if (user.type === 'customer') icon = "fa-building";

        // Role Badge (Standardized logic)
        let displayBadge = user.displayRole || user.role || "User";
        let badgeClass = "bg-gray-100 text-gray-600";
        if (displayBadge === 'Admin') badgeClass = "bg-red-100 text-red-700";
        if (displayBadge === 'Engineer') badgeClass = "bg-purple-100 text-purple-700";
        if (displayBadge === 'Sales') badgeClass = "bg-blue-100 text-blue-700";

        tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        <i class="fas ${icon}"></i>
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">${user.name}</div>
                        <div class="text-xs text-gray-500 uppercase tracking-wide">${user.type || 'Staff'}</div>
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
                   <div class="text-xs text-gray-500">${user.secondaryInfo || '-'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.branch || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${user.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                    <button class="text-blue-600 hover:text-blue-900 edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                    ${user.role !== 'admin' && user.id != 1 ? `<button class="text-red-600 hover:text-red-900 delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>` : ''}
                </td>
            `;
        tableBody.appendChild(tr);
      });
    }
  }

  // === Modal Logic ===
  function openModal(isEdit = false, userData = null) {
    modalOverlay.classList.remove("hidden");
    updateFormVisibility(); // Reset to current selector state

    // RBAC: Hide "Admin" option from Role Selector if not global admin
    const roleSelect = inputs.staffRole;
    if (roleSelect) {
      // Assuming options exist. Rebuild options? Or just hide Admin.
      // Let's assume there is an option with value="Admin".
      for (let i = 0; i < roleSelect.options.length; i++) {
        if (roleSelect.options[i].value === 'Admin') {
          if (!isGlobalAdmin) roleSelect.options[i].style.display = "none";
          else roleSelect.options[i].style.display = "block";
        }
      }
    }

    // RBAC: Lock Branch Selection for Manager
    if (!isGlobalAdmin) {
      // Disable or hide branch selectors and auto-set
      if (inputs.staffBranch) { inputs.staffBranch.value = userBranch; inputs.staffBranch.disabled = true; }
      if (inputs.dealerBranch) { inputs.dealerBranch.value = userBranch; inputs.dealerBranch.disabled = true; }
      if (inputs.customerBranch) { inputs.customerBranch.value = userBranch; inputs.customerBranch.disabled = true; }
    } else {
      if (inputs.staffBranch) inputs.staffBranch.disabled = false;
      if (inputs.dealerBranch) inputs.dealerBranch.disabled = false;
      if (inputs.customerBranch) inputs.customerBranch.disabled = false;
    }

    if (isEdit && userData) {
      modalTitle.textContent = "Edit User";
      accountTypeSelector.value = userData.type || "staff";
      accountTypeSelector.disabled = true; // Cannot change type during edit to prevent confusing data loss
      inputs.id.value = userData.id;
      inputs.status.value = userData.status || "Active";
      inputs.notes.value = userData.notes || "";

      updateFormVisibility(); // Refresh based on userData.type

      // Populate fields based on type
      if (userData.type === "staff") {
        inputs.staffName.value = userData.name;
        inputs.staffEmail.value = userData.email;
        inputs.staffRole.value = userData.role;
        inputs.staffBranch.value = userData.branch;
        inputs.staffPhone.value = userData.secondaryInfo; // We stored phone here
      } else if (userData.type === "dealer") {
        inputs.dealerCompany.value = userData.name;
        inputs.dealerContact.value = userData.contactPerson;
        inputs.dealerEmail.value = userData.email;
        inputs.dealerBranch.value = userData.branch;
        inputs.dealerServiceType.value = userData.displayRole;
      } else if (userData.type === "customer") {
        inputs.customerCompany.value = userData.name;
        inputs.customerContact.value = userData.contactPerson;
        inputs.customerEmail.value = userData.email;
        inputs.customerBranch.value = userData.branch;
        inputs.customerType.value = userData.displayRole;
      }

    } else {
      modalTitle.textContent = "Add New User";
      userForm.reset();
      accountTypeSelector.disabled = false;
      accountTypeSelector.value = "staff"; // Default
      updateFormVisibility();
      inputs.id.value = "";
      inputs.password.value = "";

      // RBAC: Auto-set branch again (reset clears it)
      if (!isGlobalAdmin) {
        if (inputs.staffBranch) inputs.staffBranch.value = userBranch;
        if (inputs.dealerBranch) inputs.dealerBranch.value = userBranch;
        if (inputs.customerBranch) inputs.customerBranch.value = userBranch;
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
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Form Submit
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = getFormData();

    if (formData.id) {
      await window.UserService.updateUser(formData.id, formData);
      window.ToastService.success("User updated successfully!");
    } else {
      await window.UserService.addUser(formData);
      window.ToastService.success("User added successfully!");
    }
    closeModal();
    await renderTable();
  });

  // Table Actions
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains("edit-btn")) {
      const users = await window.UserService.getAllUsers();
      const user = users.find(u => u.id == id);
      if (user) openModal(true, user);
    }

    if (btn.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this account?")) {
        await window.UserService.deleteUser(id);
        await renderTable();
      }
    }
  });

  // Initial Render
  renderTable();
};
