// src/scripts/admin-dashboard/settings.js

window.initSettings = function () {
    console.log("Settings Panel initialized");
    if (localStorage.getItem("userRole") !== "admin") return;

    // === UI Elements ===
    const navBtns = document.querySelectorAll(".settings-nav-btn");
    const sections = document.querySelectorAll(".settings-section");
    const saveBtns = document.querySelectorAll(".btn-save-settings");

    // General Inputs
    const genName = document.getElementById("gen-company-name");
    const genDays = document.getElementById("gen-work-days");
    const genMaint = document.getElementById("gen-maintenance");

    // Notification Inputs
    const notEmail = document.getElementById("not-email");
    const notDash = document.getElementById("not-dashboard");
    const notSummary = document.getElementById("not-summary");

    // Branch Container
    const branchesContainer = document.getElementById("branches-list-container");

    // === 1. Navigation Logic ===
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Reset styling
            navBtns.forEach(b => {
                b.classList.remove("bg-red-50", "text-red-600");
                b.classList.add("text-gray-600");
            });
            // Active styling
            btn.classList.remove("text-gray-600");
            btn.classList.add("bg-red-50", "text-red-600");

            // Show Section
            const target = btn.dataset.target;
            sections.forEach(s => s.classList.add("hidden"));
            document.getElementById(`set-${target}`).classList.remove("hidden");
        });
    });

    // === 2. Load Data ===
    function loadSettings() {
        const settings = window.SettingsService.getSettings();

        // General
        genName.value = settings.general.companyName;
        genDays.value = settings.general.workingDays;
        genMaint.checked = settings.general.maintenanceMode;

        // Notifications
        notEmail.checked = settings.notifications.emailAlerts;
        notDash.checked = settings.notifications.dashboardAlerts;
        notSummary.checked = settings.notifications.dailySummary;

        // Branches
        renderBranches(settings.branches);
    }

    function renderBranches(branches) {
        branchesContainer.innerHTML = "";
        // Get potential managers (Staff)
        const staff = window.UserService.getAllUsers().filter(u => u.type === 'staff');
        const managerOptions = staff.map(s => `<option value="${s.name}">${s.name}</option>`).join("");

        branches.forEach(b => {
            branchesContainer.innerHTML += `
            <div class="border rounded-lg p-4 bg-gray-50 branch-card" data-id="${b.id}">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-gray-800">${b.name} Branch</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" class="sr-only peer branch-active-toggle" ${b.active ? 'checked' : ''}>
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
                <div>
                   <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Branch Manager</label>
                   <select class="branch-manager-select w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-600 text-sm py-1.5 bg-white">
                       <option value="Unassigned">Unassigned</option>
                       ${managerOptions}
                   </select>
                </div>
            </div>
          `;
        });

        // Post-render: Set selected managers
        document.querySelectorAll(".branch-card").forEach((card, index) => {
            const select = card.querySelector(".branch-manager-select");
            select.value = branches[index].manager || "Unassigned";
        });
    }

    // === 3. Save Logic ===
    saveBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const section = btn.dataset.section;

            if (section === "general") {
                window.SettingsService.updateSection("general", {
                    companyName: genName.value,
                    workingDays: genDays.value,
                    maintenanceMode: genMaint.checked
                });
            }

            if (section === "notifications") {
                window.SettingsService.updateSection("notifications", {
                    emailAlerts: notEmail.checked,
                    dashboardAlerts: notDash.checked,
                    dailySummary: notSummary.checked
                });
            }

            if (section === "branches") {
                const cards = document.querySelectorAll(".branch-card");
                cards.forEach(card => {
                    const id = card.dataset.id;
                    const active = card.querySelector(".branch-active-toggle").checked;
                    const manager = card.querySelector(".branch-manager-select").value;
                    window.SettingsService.updateBranch(id, { active, manager });
                });
            }

            alert("Settings saved successfully!");
        });
    });

    // === 4. System Reset ===
    document.getElementById("btn-factory-reset").addEventListener("click", () => {
        if (confirm("CRITICAL WARNING: This will delete ALL users, services, requests, and settings. Are you absolutely sure?")) {
            window.SettingsService.resetSystem();
        }
    });

    // Init
    loadSettings();
};
