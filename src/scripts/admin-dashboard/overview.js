// src/scripts/admin-dashboard/overview.js

window.initOverview = function () {
  console.log("Overview Dashboard initialized");

  // === 1. Populate KPIs with REAL Data ===
  function updateKPIs() {
    // Data from Services
    const users = window.UserService ? window.UserService.getAllUsers() : [];
    const services = window.ServiceService ? window.ServiceService.getAllServices() : [];
    const requests = window.RequestService ? window.RequestService.getAllRequests() : [];
    const settings = window.SettingsService ? window.SettingsService.getSettings() : { branches: [1, 2, 3] };

    // Update Texts
    if (document.getElementById("ov-total-users"))
      document.getElementById("ov-total-users").textContent = users.length;

    if (document.getElementById("ov-active-services"))
      document.getElementById("ov-active-services").textContent = services.filter(s => s.status === 'Active').length;

    if (document.getElementById("ov-pending-requests"))
      document.getElementById("ov-pending-requests").textContent = requests.filter(r => r.status === 'Pending').length;

    if (document.getElementById("ov-total-branches"))
      document.getElementById("ov-total-branches").textContent = settings.branches ? settings.branches.filter(b => b.active).length : 3;
  }

  // === 2. Navigation Logic ===
  document.querySelectorAll(".kpi-card").forEach(card => {
    card.addEventListener("click", () => {
      const target = card.dataset.target; // "users", "services", "requests"
      if (target) {
        const sidebarLink = document.querySelector(`a[data-section="${target}"]`);
        if (sidebarLink) sidebarLink.click();
      }
    });
  });

  // === 3. Live Activity Feed ===
  function updateActivity() {
    const container = document.getElementById("ov-activity-log");
    if (!container || !window.ReportService) return;

    const logs = window.ReportService.getActivityLog().slice(0, 5); // Top 5
    container.innerHTML = "";

    if (logs.length === 0) {
      container.innerHTML = `<li class="text-gray-400 italic">No recent activity.</li>`;
      return;
    }

    logs.forEach(log => {
      const icon = log.type === 'Service' ? '🛠️' : '📩';
      container.innerHTML += `
            <li class="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded transition">
               <span>${icon}</span>
               <div>
                  <div class="text-gray-800 font-medium">${log.text}</div>
                  <div class="text-xs text-gray-500">${log.date} • ${log.branch}</div>
               </div>
            </li>
          `;
    });
  }

  // === 4. STANDARD MONTHLY CALENDAR ===
  let currentUiDate = new Date(); // State for calendar navigation

  function renderMonthlyCalendar() {
    const gridContainer = document.getElementById("calendar-grid");
    const titleEl = document.getElementById("calendarTitle");
    const branchFilter = document.getElementById("branchFilter");

    if (!gridContainer || !titleEl) return;

    // A. Setup Dates
    const year = currentUiDate.getFullYear();
    const month = currentUiDate.getMonth(); // 0-indexed

    // Update Title
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    titleEl.textContent = `${monthNames[month]} ${year}`;

    // Calendar Math
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // B. Get Data & Filter by Branch
    const selectedBranch = branchFilter ? branchFilter.value.toLowerCase() : 'all'; // e.g., "lagos", "ph", "abuja"

    // Helper: Check if item matches branch
    // Note: Real data structure usually has a 'branch' property. 
    // We simulate checking the branch (assuming user/client has branch info or the service itself has it)
    const checkBranch = (item) => {
      // If the item has a direct branch property
      if (item.branch && item.branch.toLowerCase().includes(selectedBranch)) return true;
      // If we need to look up client branch (services usually have clientName)
      const client = window.UserService ? window.UserService.getAllUsers().find(u => u.name === item.clientName) : null;
      if (client && client.branch && client.branch.toLowerCase().includes(selectedBranch)) return true;

      return false;
    };

    const services = window.ServiceService.getAllServices().filter(s => checkBranch(s));
    const requests = window.RequestService.getAllRequests().filter(r => r.status === 'Pending' && checkBranch(r));

    // C. Build Grid
    gridContainer.innerHTML = "";

    // 1. Empty Cells for days before 1st of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("h-24", "bg-gray-50", "rounded-lg"); // Visual placeholder
      gridContainer.appendChild(emptyCell);
    }

    // 2. Day Cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // Find events for this day
      const daysServices = services.filter(s => s.startDate === dateStr);
      const daysRequests = requests.filter(r => r.dateSubmitted === dateStr);

      const hasEvents = daysServices.length > 0 || daysRequests.length > 0;

      // Cell Container
      const cell = document.createElement("div");
      cell.classList.add("h-24", "border", "border-gray-200", "rounded-lg", "p-2", "relative", "bg-white", "hover:border-red-500", "transition", "cursor-pointer", "flex", "flex-col", "gap-1");

      // Date Number
      const num = document.createElement("span");
      num.textContent = day;
      num.classList.add("text-sm", "font-medium", "text-gray-700");
      if (new Date().toDateString() === new Date(year, month, day).toDateString()) {
        num.classList.add("bg-red-600", "text-white", "rounded-full", "w-6", "h-6", "flex", "items-center", "justify-center");
      }
      cell.appendChild(num);

      // Event Indicators (Dots/Text)
      if (daysServices.length > 0) {
        const badge = document.createElement("div");
        badge.className = "text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded truncate font-medium";
        badge.textContent = `${daysServices.length} Service${daysServices.length > 1 ? 's' : ''}`;
        cell.appendChild(badge);
      }

      if (daysRequests.length > 0) {
        const badge = document.createElement("div");
        badge.className = "text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded truncate font-medium";
        badge.textContent = `${daysRequests.length} Request${daysRequests.length > 1 ? 's' : ''}`;
        cell.appendChild(badge);
      }

      // Hover Tooltip (Simple Title for now, or Custom Div)
      if (hasEvents) {
        const tooltipText = [
          ...daysServices.map(s => `🔧 ${s.clientName} (${s.type})`),
          ...daysRequests.map(r => `📩 ${r.clientName || r.requestedBy} (${r.type})`)
        ].join('\n');
        cell.title = tooltipText;
      }

      // Click Action -> Switch to Weekly View
      cell.addEventListener("click", () => {
        const weeklyBtn = document.getElementById("weeklyBtn");
        if (weeklyBtn) weeklyBtn.click();
      });

      gridContainer.appendChild(cell);
    }
  }

  // Bind Navigation Buttons
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const branchSelect = document.getElementById("branchFilter");

  if (prevBtn) {
    // Cloning to remove old listeners if any (simple trick) or just checking logic
    // Better to attach once, but since initOverview might run once, direct attach is fine. 
    // We use a check to avoid duplicate listeners if init is called multiple times? 
    // Actually, initOverview implies full re-run. Let's assume standard event delegation or simple attach.
    prevBtn.onclick = () => {
      currentUiDate.setMonth(currentUiDate.getMonth() - 1);
      renderMonthlyCalendar();
    };
  }
  if (nextBtn) {
    nextBtn.onclick = () => {
      currentUiDate.setMonth(currentUiDate.getMonth() + 1);
      renderMonthlyCalendar();
    };
  }

  // Re-render when branch changes
  if (branchSelect) {
    branchSelect.addEventListener('change', () => {
      // If monthly view is active, re-render
      const monthlyTable = document.getElementById("monthlyTable");
      if (monthlyTable && !monthlyTable.classList.contains("hidden")) {
        renderMonthlyCalendar();
      }
    });
  }


  // === 5. Table Toggles (Weekly/Monthly) ===
  const weeklyBtn = document.getElementById("weeklyBtn");
  const monthlyBtn = document.getElementById("monthlyBtn");
  const weeklyTable = document.getElementById("weeklyTable");
  const monthlyTable = document.getElementById("monthlyTable");

  if (weeklyBtn && monthlyBtn) {
    weeklyBtn.addEventListener("click", () => {
      weeklyTable.classList.remove("hidden");
      monthlyTable.classList.add("hidden");
      weeklyTable.classList.add("block");

      monthlyTable.classList.remove("flex");

      weeklyBtn.classList.add("bg-red-600", "text-white");
      weeklyBtn.classList.remove("bg-gray-200", "text-gray-700");
      monthlyBtn.classList.remove("bg-red-600", "text-white");
      monthlyBtn.classList.add("bg-gray-200", "text-gray-700");
    });

    monthlyBtn.addEventListener("click", () => {
      monthlyTable.classList.remove("hidden");
      monthlyTable.classList.add("flex"); // Flex needed for new layout

      weeklyTable.classList.add("hidden");
      weeklyTable.classList.remove("block");

      monthlyBtn.classList.add("bg-red-600", "text-white");
      monthlyBtn.classList.remove("bg-gray-200", "text-gray-700");
      weeklyBtn.classList.remove("bg-red-600", "text-white");
      weeklyBtn.classList.add("bg-gray-200", "text-gray-700");

      // Render only when visible to save resources
      renderMonthlyCalendar();
    });
  }

  // === Initial Load ===
  setTimeout(() => {
    updateKPIs();
    updateActivity();
  }, 100);
};
