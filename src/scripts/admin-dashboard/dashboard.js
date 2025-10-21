// src/scripts/admin-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // === LOGIN CHECK ===
  if (localStorage.getItem("userRole") !== "admin") {
    alert("Access denied. Please log in as admin.");
    window.location.href = "../../index.html";
    return;
  }

  // === LOGOUT HANDLER ===
  document.addEventListener("click", (e) => {
    if (e.target.id === "logout-btn") {
      localStorage.clear();
      window.location.href = "../../index.html";
    }
  });

  // === Dynamic Section Loader (optional) ===
  // Future feature: load dashboard sections dynamically if needed
  console.log("Admin Dashboard Loaded Successfully");
});

  // === PATHS ===
  const basePath = "../../pages/admin-dashboard/";
  const sectionsPath = `${basePath}sections/`;

  // === CONTAINERS ===
  const dashboardContainer = document.getElementById("dashboard-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const topbarContainer = document.getElementById("topbar-container");

  // === LOAD COMPONENTS (Sidebar & Topbar) ===
  async function loadComponent(container, file) {
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (err) {
      console.error(`Error loading ${file}:`, err);
    }
  }

  await loadComponent(sidebarContainer, `${sectionsPath}sidebar.html`);
  await loadComponent(topbarContainer, `${sectionsPath}topbar.html`);

  // === DEFAULT SECTION ===
  await loadSection("overview");

  // === LOAD SECTION DYNAMICALLY ===
  async function loadSection(sectionName) {
    try {
      const response = await fetch(`${sectionsPath}${sectionName}.html`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      dashboardContainer.innerHTML = html;

      // Fade-in animation
      dashboardContainer.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => {
        dashboardContainer.classList.remove("opacity-0", "translate-y-4");
        dashboardContainer.classList.add("opacity-100");
      }, 50);
    } catch (err) {
      console.error(`Error loading ${sectionName}:`, err);
    }
  }

  // === SIDEBAR NAVIGATION ===
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;

    const section = link.dataset.section;
    loadSection(section);

    // Highlight active section
    document.querySelectorAll("[data-section]").forEach((btn) => {
      btn.classList.remove("bg-red-600", "text-white");
      btn.classList.add("text-gray-700", "hover:bg-red-50");
    });

    link.classList.add("bg-red-600", "text-white");
    link.classList.remove("text-gray-700", "hover:bg-red-50");
  });

  // === LOGOUT HANDLER ===
  document.addEventListener("click", (e) => {
    if (e.target.id === "logout-btn") {
      localStorage.removeItem("userRole");
      alert("Logging out...");
      window.location.href = "../../../index.html";
    }
  });
});
