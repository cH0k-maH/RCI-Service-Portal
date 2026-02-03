// src/scripts/staff-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
    // ===============================
    // 1. AUTH & ROLE CHECK
    // ===============================
    if (!window.AuthService) {
        console.error("AuthService not found!");
        return;
    }

    // Check against mock auth or localStorage directly for now
    // In a real app, AuthService.isAuthenticated() would verify the token
    const role = localStorage.getItem("userRole");

    // Allow 'admin' to peek, but primarily for 'staff'
    if (role !== "staff" && role !== "admin") {
        window.ToastService.error("Access denied. Please log in.");
        window.location.href = "../../../index.html";
        return;
    }

    // Get Staff Details
    // Defaulting to "engineer" and "Lagos" if not set, for development testing
    const staffType = (localStorage.getItem("staffType") || "engineer").toLowerCase();
    const branch = localStorage.getItem("branch") || "Lagos";
    const userName = localStorage.getItem("userName") || "Staff Member";

    console.log(`Staff Dashboard: Logged in as ${role} (${staffType}) - ${branch}`);


    // ===============================
    // 2. PATHS & CONTAINERS
    // ===============================
    const basePath = "../../pages/staff-dashboard/";
    const sectionsPath = basePath + "sections/";
    const scriptsPath = "../../scripts/staff-dashboard/";

    const dashboardContainer = document.getElementById("dashboard-container");
    const sidebarContainer = document.getElementById("sidebar-container");
    const topbarContainer = document.getElementById("topbar-container");

    if (!dashboardContainer || !sidebarContainer || !topbarContainer) {
        console.error("Dashboard containers missing");
        return;
    }

    // ===============================
    // 3. LOAD UTILS
    // ===============================
    async function loadComponent(container, filePath) {
        try {
            const res = await fetch(filePath + "?v=" + Date.now());
            if (!res.ok) throw new Error("Failed to load " + filePath);
            container.innerHTML = await res.text();
        } catch (err) {
            console.error(err);
        }
    }

    function updateSidebarState(activeSection) {
        document.querySelectorAll("[data-section]").forEach((el) => {
            if (el.dataset.section === activeSection) {
                el.classList.add("bg-red-600", "text-white");
                el.classList.remove("text-gray-700", "hover:bg-gray-100");
            } else {
                el.classList.remove("bg-red-600", "text-white");
                el.classList.add("text-gray-700", "hover:bg-gray-100");
            }
        });
    }

    function applyRolePermissions() {
        // Logic:
        // - "manager" sees everything they are tagged in + generic
        // - "engineer" sees generic + engineer tagged (if any)
        // - data-role="manager,driver" means EITHER can see it

        document.querySelectorAll("[data-role]").forEach(el => {
            const allowedRoles = el.dataset.role.split(",");
            if (!allowedRoles.includes(staffType)) {
                el.classList.add("hidden");
                // Remove the element entirely to prevent clicking via inspector if strict
                el.remove();
            } else {
                el.classList.remove("hidden");
            }
        });
    }

    function updateProfileUI() {
        const nameEl = document.getElementById("user-name");
        const roleEl = document.getElementById("user-role");
        const initialsEl = document.getElementById("topbar-initials");
        const avatarImg = document.getElementById("topbar-avatar-img");

        if (nameEl) nameEl.textContent = userName;
        if (roleEl) roleEl.textContent = `${staffType} • ${branch}`;

        if (window.UserService && initialsEl) {
            initialsEl.textContent = window.UserService.getInitials(userName);
            const savedPic = localStorage.getItem("userProfilePic");
            if (savedPic && avatarImg) {
                avatarImg.src = savedPic;
                avatarImg.classList.remove("hidden");
                initialsEl.classList.add("hidden");
            }
        }
    }

    // ===============================
    // 4. LOAD SECTIONS
    // ===============================
    async function loadSection(sectionName) {
        try {
            // Update Title
            const titleEl = document.getElementById("page-title");
            if (titleEl) titleEl.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

            // ---- Load HTML ----
            const res = await fetch(
                sectionsPath + sectionName + ".html?v=" + Date.now()
            );
            if (!res.ok) throw new Error("Section not found: " + sectionName);

            dashboardContainer.innerHTML = await res.text();

            // ---- Remove old section JS ----
            const oldScript = document.getElementById("section-script");
            if (oldScript) oldScript.remove();

            // ---- Load section JS if it exists ----
            const script = document.createElement("script");
            script.src = scriptsPath + sectionName + ".js?v=" + Date.now();
            script.id = "section-script";
            script.defer = true;

            script.onload = () => {
                // Init function convention: initSectionName
                const camelCaseName = sectionName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                const initFnName = "init" + camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
                const initFn = window[initFnName];

                if (typeof initFn === "function") initFn();
            };

            script.onerror = () => { console.info(`No JS for ${sectionName}`); };

            document.body.appendChild(script);

            // ---- Update UI ----
            updateSidebarState(sectionName);

        } catch (err) {
            console.error("Error loading section:", err);
            dashboardContainer.innerHTML =
                "<div class='p-6 text-center text-gray-500'><h3>Content Unavailable</h3><p>Could not load this section.</p></div>";
        }
    }

    // ===============================
    // 5. INIT
    // ===============================

    // Load Static Layout
    await loadComponent(sidebarContainer, sectionsPath + "sidebar.html");
    await loadComponent(topbarContainer, sectionsPath + "topbar.html");

    // Apply Logic
    applyRolePermissions(); // Hide menu items based on staffType
    updateProfileUI();      // Update Topbar info

    // Initialize Notifications
    if (window.NotificationUI) {
        const userId = localStorage.getItem("userId") || 3; // Fallback for staff
        window.NotificationUI.init(userId, 'staff');
    }

    // Handle Routing
    function handleHashChange() {
        const hash = window.location.hash.substring(1);
        const section = hash || "overview";
        loadSection(section);
    }

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial load

    // ===============================
    // 6. EVENT LISTENERS
    // ===============================
    document.addEventListener("click", (e) => {
        // Sidebar Nav
        const btn = e.target.closest("[data-section]");
        if (btn) {
            const section = btn.dataset.section;
            window.location.hash = section;
        }

        // Mobile Menu Toggle
        const mobileBtn = e.target.closest("#mobile-menu-btn");
        if (mobileBtn) {
            sidebarContainer.classList.toggle("hidden");
            sidebarContainer.classList.toggle("absolute");
            sidebarContainer.classList.toggle("z-50");
            sidebarContainer.classList.toggle("h-full");
        }

        // Logout
        if (e.target.id === "logout-btn" || e.target.closest("#logout-btn")) {
            window.AuthService.logout();
        }
    });
});
