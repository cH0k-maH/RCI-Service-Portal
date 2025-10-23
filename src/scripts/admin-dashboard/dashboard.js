// src/scripts/admin-dashboard/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // === LOGIN CHECK ===
  if (localStorage.getItem("userRole") !== "admin") {
    alert("Access denied. Please log in as admin.");
    window.location.href = "../../index.html";
    return;
  }

  // === PATHS ===
  const basePath = "../../pages/admin-dashboard/";
  const sectionsPath = `${basePath}sections/`;

  // === CONTAINERS ===
  const dashboardContainer = document.getElementById("dashboard-container");
  const sidebarContainer = document.getElementById("sidebar-container");
  const topbarContainer = document.getElementById("topbar-container");

  // === LOAD COMPONENT FUNCTION ===
  async function loadComponent(container, file) {
    try {
      const response = await fetch(file + `?v=${Date.now()}`);
      const html = await response.text();
      container.innerHTML = html;
    } catch (err) {
      console.error(`Error loading ${file}:`, err);
    }
  }

  // === LOAD SIDEBAR & TOPBAR ===
  await loadComponent(sidebarContainer, `${sectionsPath}sidebar.html`);
  await loadComponent(topbarContainer, `${sectionsPath}topbar.html`);

  // === LOAD DEFAULT SECTION ===
  await loadSection("overview");

  // === LOAD SECTION FUNCTION ===
  async function loadSection(sectionName) {
    try {
      const response = await fetch(`${sectionsPath}${sectionName}.html?v=${Date.now()}`);
      const html = await response.text();
      dashboardContainer.innerHTML = html;

      // Simple fade-in animation
      dashboardContainer.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => {
        dashboardContainer.classList.remove("opacity-0", "translate-y-4");
        dashboardContainer.classList.add("opacity-100");
      }, 50);
    } catch (err) {
      console.error(`Error loading ${sectionName}:`, err);
    }
  }

  // === SIDEBAR NAVIGATION HANDLER ===
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;

    const section = link.dataset.section;
    loadSection(section);

    // Highlight active button
    document.querySelectorAll("[data-section]").forEach((btn) => {
      btn.classList.remove("bg-red-600", "text-white");
      btn.classList.add("text-gray-700", "hover:bg-gray-100");
    });
    link.classList.add("bg-red-600", "text-white");
    link.classList.remove("text-gray-700", "hover:bg-gray-100");
  });

  // === LOGOUT HANDLER ===
  document.addEventListener("click", (e) => {
    if (e.target.id === "logout-btn") {
      localStorage.clear();
      alert("Logging out...");
      window.location.href ="../../../index.html";
    }
  });
});

