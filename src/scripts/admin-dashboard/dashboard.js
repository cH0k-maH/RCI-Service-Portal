// src/scripts/admin-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // ===============================
  // LOGIN CHECK
  // ===============================
  // Ensure AuthService is available
  if (!window.AuthService) {
    console.error("AuthService not found!");
    alert("System Error: Auth service missing.");
    return;
  }

  // Check if user is logged in
  if (!window.AuthService.isAuthenticated()) {
    window.location.href = "../../../index.html";
    return;
  }

  // Get current user and role
  const currentUser = {
    role: localStorage.getItem("staffType"), // "manager", "admin"
    type: window.AuthService.getRole() // "staff", "admin"
  };

  const isGlobalAdmin = window.AuthService.getRole() === 'admin' || (currentUser.role && currentUser.role.toUpperCase() === 'ADMIN');

  // Allow Admin, Manager, Secretary to access Admin Dashboard
  const allowedRoles = ["ADMIN", "MANAGER", "SECRETARY"];
  const userRoleKey = (currentUser.role || "").toUpperCase();

  // Basic Access Check
  // Note: "ADMIN" logic usually covers system admin. Manager/Secretary are staff but privileged.
  if (currentUser.type !== 'admin' && !allowedRoles.includes(userRoleKey)) {
    alert("Access denied. Use the Staff Dashboard.");
    window.location.href = "../staff-dashboard/staff-dashboard.html";
    return;
  }

  // Apply Permissions to UI
  function applyPermissions() {
    const user = { role: currentUser.role }; // Minimal user object for check

    // 1. Sidebar Filtering
    // Define REQUIRED permissions for each section.
    // If a user has ANY of the permissions listed for a section, they can see it.
    const sections = {
      "settings": ["global_settings"],
      "manage-staff": ["view_all_users", "view_branch_users"],
      "manage-customers": ["view_all_users", "view_branch_users", "view_assigned_users"],
      "reports": ["view_branch_reports", "view_all_reports"],
      "requests": ["view_all_jobs", "approve_job_sheets"],
      "services": ["view_all_jobs", "assign_services", "view_assigned_jobs"]
    };

    for (const [section, permissions] of Object.entries(sections)) {
      const btn = document.querySelector(`button[data-section="${section}"]`);
      if (btn) {
        // Debug Check
        // const hasAccess = permissions.some(p => window.UserService.can(user, p));

        let hasAccess = false;
        // Manual Check to debug
        if (window.RoleConfig) {
          hasAccess = permissions.some(p => window.RoleConfig.hasPermission(user, p));
          console.log(`Section ${section}: Access=${hasAccess}`);
        } else {
          // Fallback: If Manager, allow all except settings
          // This ensures stability if scripts load out of order
          const role = (user.role || "").toLowerCase();
          if (role === 'manager' && section !== 'settings') hasAccess = true;
          else if (role === 'admin') hasAccess = true;
        }

        if (!hasAccess) {
          btn.classList.add("hidden");
        } else {
          btn.classList.remove("hidden");
        }
      }
    }
  }

  // ===============================
  // PATHS
  // ===============================
  const basePath = "../../pages/admin-dashboard/";
  const sectionsPath = basePath + "sections/";
  const scriptsPath = "../../scripts/admin-dashboard/";

  // ===============================
  // CONTAINERS
  // ===============================
  const dashboardContainer = document.getElementById("dashboard-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const topbarContainer = document.getElementById("topbar-container");

  if (!dashboardContainer || !sidebarContainer || !topbarContainer) {
    console.error("Dashboard containers missing");
    return;
  }

  // ===============================
  // UTILITIES
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

  // ===============================
  // LOAD SECTIONS
  // ===============================
  async function loadSection(sectionName) {
    try {
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
        // Convert hyphenated section name (e.g., "manage-users") to camelCase ("manageUsers")
        const camelCaseName = sectionName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        const initFnName = "init" + camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1);
        const initFn = window[initFnName];

        if (typeof initFn === "function") initFn();
      };

      script.onerror = () => {
        // JS is optional — no error
        console.info(`No JS file for section: ${sectionName}`);
      };

      document.body.appendChild(script);

      // ---- Update UI ----
      updateSidebarState(sectionName);

      // ---- Animation ----
      dashboardContainer.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => {
        dashboardContainer.classList.remove("opacity-0", "translate-y-4");
        dashboardContainer.classList.add("opacity-100");
      }, 50);

    } catch (err) {
      console.error("Error loading section:", err);
      dashboardContainer.innerHTML =
        "<div class='p-6 text-center text-gray-500'><h3>Section not found</h3><p>The requested section could not be loaded.</p></div>";
    }
  }

  // ===============================
  // INITIALIZATION
  // ===============================

  // 1. Load Static Components
  await loadComponent(sidebarContainer, sectionsPath + "sidebar.html");
  await loadComponent(topbarContainer, sectionsPath + "topbar.html");

  // Apply Permissions (Hide sidebar items)
  applyPermissions();

  // Dynamic Title Update
  // Note: sidebar.html has <h1>RCI Admin</h1>. We target it.
  const titleEl = sidebarContainer.querySelector("h1");
  if (titleEl) {
    if (isGlobalAdmin) {
      titleEl.textContent = "RCI Admin";
    } else if (currentUser.role && currentUser.role.toLowerCase() === 'manager') {
      titleEl.textContent = "RCI Manager";
    } else {
      titleEl.textContent = "RCI Staff";
    }
  }

  // 2. Handle Routing (Hash-based)
  function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove '#'
    const section = hash || "overview"; // Default to overview
    loadSection(section);
  }

  // Listen for hash changes
  window.addEventListener("hashchange", handleHashChange);

  // Initial load
  handleHashChange();


  // ===============================
  // EVENT LISTENERS
  // ===============================

  // Sidebar Navigation
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-section]");
    if (!btn) return;

    const section = btn.dataset.section;
    // Update hash, which triggers handleHashChange -> loadSection
    window.location.hash = section;
  });

  // Logout
  document.addEventListener("click", (e) => {
    if (e.target.id === "logout-btn") {
      window.AuthService.logout();
      // logout() handles redirect/reload
    }
  });
});

