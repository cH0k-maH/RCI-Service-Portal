// src/scripts/admin-dashboard/reports.js

window.initReports = function () {
    console.log("Reports Analytics initialized");
    if (localStorage.getItem("userRole") !== "admin") return;

    // === UI Elements ===
    const tabs = document.querySelectorAll(".report-tab");
    const views = document.querySelectorAll(".report-view");

    const kpiActive = document.getElementById("rep-active-jobs");
    const kpiPending = document.getElementById("rep-pending-req");
    const kpiCompleted = document.getElementById("rep-completed-mo");
    const kpiClients = document.getElementById("rep-total-clients");

    const barsContainer = document.getElementById("visual-bars-container");
    const branchTableBody = document.getElementById("branch-table-body");
    const activityLogContainer = document.getElementById("full-activity-log");

    // === 1. Tab Switching ===
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Reset Tabs
            tabs.forEach(t => {
                t.classList.remove("bg-red-50", "text-red-600");
                t.classList.add("text-gray-500");
            });
            // Activate Clicked
            tab.classList.remove("text-gray-500");
            tab.classList.add("bg-red-50", "text-red-600");

            // Hide Views
            views.forEach(v => v.classList.add("hidden"));
            // Show Target
            document.getElementById(`view-${tab.dataset.target}`).classList.remove("hidden");
        });
    });

    // === 2. Render Overview (KPIs & Charts) ===
    function renderOverview() {
        const overall = window.ReportService.getOverallKPIs();
        const branchStats = window.ReportService.getBranchStats();

        // Top KPIs
        kpiActive.textContent = overall.activeJobs;
        kpiPending.textContent = overall.pendingApprovals;
        kpiCompleted.textContent = overall.completedJobsMonth;
        kpiClients.textContent = overall.totalClients;

        // Visual Bars (Services per Branch)
        let maxServices = 0;
        Object.keys(branchStats).forEach(b => {
            if (branchStats[b].totalServices > maxServices) maxServices = branchStats[b].totalServices;
        });
        // Avoid division by zero
        if (maxServices === 0) maxServices = 1;

        barsContainer.innerHTML = "";
        Object.keys(branchStats).forEach(branch => {
            const count = branchStats[branch].totalServices;
            const percentage = (count / maxServices) * 100;

            barsContainer.innerHTML += `
            <div>
               <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>${branch}</span>
                  <span>${count} Services</span>
               </div>
               <div class="w-full bg-gray-100 rounded-full h-4">
                  <div class="bg-red-500 h-4 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
               </div>
            </div>
          `;
        });
    }

    // === 3. Render Branch Table ===
    function renderBranchTable() {
        const stats = window.ReportService.getBranchStats();
        branchTableBody.innerHTML = "";

        Object.keys(stats).forEach(branch => {
            const s = stats[branch];
            // Simple health check logic
            let health = `<span class="text-green-600 font-bold">Good</span>`;
            if (s.pendingRequests > 3) health = `<span class="text-yellow-600 font-bold">Needs Review</span>`;
            if (s.pendingRequests > 8) health = `<span class="text-red-600 font-bold">Critical</span>`;

            branchTableBody.innerHTML += `
             <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${branch}</td>
                <td class="px-6 py-4 text-center text-gray-600">${s.totalServices}</td>
                <td class="px-6 py-4 text-center text-blue-600 font-bold">${s.activeServices}</td>
                <td class="px-6 py-4 text-center text-red-600">${s.pendingRequests}</td>
                <td class="px-6 py-4 text-center">${health}</td>
             </tr>
          `;
        });
    }

    // === 4. Render Activity Log ===
    function renderActivityLog() {
        const logs = window.ReportService.getActivityLog();
        activityLogContainer.innerHTML = "";

        if (logs.length === 0) {
            activityLogContainer.innerHTML = `<p class="text-gray-500 italic p-4">No activity recorded yet.</p>`;
            return;
        }

        logs.forEach((log, index) => {
            const isLast = index === logs.length - 1;
            const iconColor = log.type === 'Service' ? 'bg-blue-500' : 'bg-purple-500';
            activityLogContainer.innerHTML += `
            <div class="flex gap-4">
               <div class="flex flex-col items-center">
                   <div class="w-3 h-3 rounded-full ${iconColor} mt-1.5"></div>
                   ${!isLast ? '<div class="w-0.5 flex-1 bg-gray-200 my-1"></div>' : ''}
               </div>
               <div class="pb-6">
                   <div class="text-xs text-gray-400 font-mono mb-0.5">${log.date} • ${log.branch}</div>
                   <div class="text-sm text-gray-800">${log.text}</div>
               </div>
            </div>
          `;
        });
    }

    // === 5. Export Buttons ===
    document.getElementById("btn-export-pdf").addEventListener("click", () => alert("PDF Export functionality coming soon!"));
    document.getElementById("btn-export-csv").addEventListener("click", () => alert("CSV Export functionality coming soon!"));

    // Init
    renderOverview();
    renderBranchTable();
    renderActivityLog();
};
