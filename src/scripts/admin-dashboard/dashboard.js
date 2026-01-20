// src/scripts/admin-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // ===============================
  // LOGIN CHECK
  // ===============================
  if (localStorage.getItem("userRole") !== "admin") {
    alert("Access denied. Please log in as admin.");
    window.location.href = "../../index.html";
    return;
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
  // LOAD STATIC COMPONENT (SIDEBAR / TOPBAR)
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

  await loadComponent(sidebarContainer, sectionsPath + "sidebar.html");
  await loadComponent(topbarContainer, sectionsPath + "topbar.html");

  // ===============================
  // LOAD SECTION (HTML + JS AUTO)
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
        // JS is optional — no error, no blank page
        console.info(`No JS file for section: ${sectionName}`);
      };

      document.body.appendChild(script);

      // ---- Simple animation ----
      dashboardContainer.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => {
        dashboardContainer.classList.remove("opacity-0", "translate-y-4");
        dashboardContainer.classList.add("opacity-100");
      }, 50);
    } catch (err) {
      console.error("Error loading section:", err);
      dashboardContainer.innerHTML =
        "<p class='text-red-500'>Failed to load section.</p>";
    }
  }

  // ===============================
  // DEFAULT SECTION
  // ===============================
  loadSection("overview");

  // ===============================
  // SIDEBAR NAVIGATION
  // ===============================
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-section]");
    if (!btn) return;

    const section = btn.dataset.section;
    loadSection(section);

    // Active state
    document.querySelectorAll("[data-section]").forEach((el) => {
      el.classList.remove("bg-red-600", "text-white");
      el.classList.add("text-gray-700", "hover:bg-gray-100");
    });

    btn.classList.add("bg-red-600", "text-white");
    btn.classList.remove("text-gray-700", "hover:bg-gray-100");
  });

  // ===============================
  // LOGOUT
  // ===============================
  document.addEventListener("click", (e) => {
    if (e.target.id === "logout-btn") {
      localStorage.clear();
      alert("Logging out...");
      window.location.href = "../../../index.html";
    }
  });
});
