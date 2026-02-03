// src/scripts/client-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {

    // 1. ROLE & AUTH CHECK
    const role = localStorage.getItem("userRole");
    const staffType = (localStorage.getItem("staffType") || "customer").toLowerCase(); // dealer or customer
    const userName = localStorage.getItem("userName") || "Client";
    const branch = localStorage.getItem("branch") || "Lagos";

    if (role !== "dealer" && role !== "customer") {
        console.warn("Redirecting: Not a client role");
        window.location.href = "../../../index.html";
        return;
    }

    console.log(`Client Portal: ${userName} (${staffType})`);

    // 2. PATHS
    const sectionsPath = "sections/";
    const scriptsPath = "../../scripts/client-dashboard/";

    const dashboardContainer = document.getElementById("dashboard-container");
    const sidebarContainer = document.getElementById("sidebar-container");
    const topbarContainer = document.getElementById("topbar-container");

    // 3. LOAD COMPONENTS
    async function loadComponent(container, fileName) {
        try {
            const res = await fetch(sectionsPath + fileName + "?v=" + Date.now());
            if (!res.ok) throw new Error(`Failed to load ${fileName}`);
            container.innerHTML = await res.text();
        } catch (err) {
            console.error(err);
        }
    }

    async function loadSection(sectionName) {
        try {
            // Load HTML
            const res = await fetch(sectionsPath + sectionName + ".html?v=" + Date.now());
            if (!res.ok) throw new Error(`Section not found: ${sectionName}`);
            dashboardContainer.innerHTML = await res.text();

            // Handle Active Sidebar State
            document.querySelectorAll("[data-section]").forEach(btn => {
                if (btn.dataset.section === sectionName) {
                    btn.classList.add("bg-red-600", "text-white");
                    btn.classList.remove("text-gray-500", "hover:bg-gray-50");
                } else {
                    btn.classList.remove("bg-red-600", "text-white");
                    btn.classList.add("text-gray-500", "hover:bg-gray-50");
                }
            });

            // Load JS
            const oldScript = document.getElementById("section-script");
            if (oldScript) oldScript.remove();

            const script = document.createElement("script");
            script.src = scriptsPath + sectionName + ".js?v=" + Date.now();
            script.id = "section-script";
            script.defer = true;
            script.onload = () => {
                const camelName = sectionName.replace(/-([a-z])/g, g => g[1].toUpperCase());
                const initFn = window["init" + camelName.charAt(0).toUpperCase() + camelName.slice(1)];
                if (typeof initFn === "function") initFn();
            };
            script.onerror = () => console.info(`No specific JS for ${sectionName}`);
            document.body.appendChild(script);

        } catch (err) {
            console.error(err);
            dashboardContainer.innerHTML = "<div class='p-12 text-center text-gray-400'><h3>Feature coming soon</h3></div>";
        }
    }

    // 4. INITIALIZE LAYOUT
    await loadComponent(sidebarContainer, "sidebar.html");
    await loadComponent(topbarContainer, "topbar.html");

    // Role-based visibility in sidebar
    document.querySelectorAll("[data-role]").forEach(el => {
        const roles = el.dataset.role.split(",");
        if (!roles.includes(staffType)) {
            el.remove();
        } else {
            el.classList.remove("hidden");
        }
    });

    // Update Topbar
    const nameDisplay = document.getElementById("client-name");
    const roleDisplay = document.getElementById("client-type");
    const initialsEl = document.getElementById("topbar-initials");
    const profileImg = document.getElementById("profile-img");

    if (nameDisplay) nameDisplay.textContent = userName;
    if (roleDisplay) roleDisplay.textContent = staffType.toUpperCase();

    // Initialize Notifications
    if (window.NotificationUI) {
        const userId = localStorage.getItem("userId") || 7; // Fallback for client
        window.NotificationUI.init(userId, 'client');
    }

    if (window.UserService && initialsEl) {
        initialsEl.textContent = window.UserService.getInitials(userName);
        const savedPic = localStorage.getItem("userProfilePic");
        if (savedPic && profileImg) {
            profileImg.src = savedPic;
            profileImg.classList.remove("hidden");
            initialsEl.classList.add("hidden");
        }
    }

    // Routing
    function handleHash() {
        const section = window.location.hash.slice(1) || "overview";
        loadSection(section);
    }
    window.addEventListener("hashchange", handleHash);
    handleHash();

    // Event Listeners
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-section]");
        if (btn) window.location.hash = btn.dataset.section;

        if (e.target.id === "logout-btn" || e.target.closest("#logout-btn")) {
            window.AuthService.logout();
        }
    });
});
