// src/scripts/staff-dashboard/activities.js
window.initActivities = function () {
    console.log("Initializing Action Dashboard");

    const staffType = localStorage.getItem("staffType") || "engineer";
    const userName = localStorage.getItem("userName") || "Staff Member";

    // DOM Elements
    const nameEl = document.getElementById("dash-user-name");
    const subGreetingEl = document.getElementById("dash-greeting-sub");
    const activityTitleEl = document.getElementById("activity-card-title");
    const activitySeeAllBtn = document.getElementById("activity-see-all");
    const activityListContainer = document.getElementById("activity-list-container");
    const pendingUploadsList = document.getElementById("pending-uploads-list");
    const statPendingTasks = document.getElementById("stat-pending-tasks");
    const statAlerts = document.getElementById("stat-alerts");

    // Set Greeting
    if (nameEl) nameEl.textContent = userName;

    const isSales = staffType === 'sales';
    const isEngineer = staffType === 'engineer';

    // Mock Data based on Philosophy
    const salesActions = [
        { title: "Upload Sales Sheet: First Bank Plc", time: "Due: 2:00 PM", priority: "High", icon: "fa-file-invoice-dollar", color: "text-red-600", bg: "bg-red-50" },
        { title: "Visit Customer: TechSolutions", time: "Tomorrow", priority: "Normal", icon: "fa-car-side", color: "text-blue-600", bg: "bg-blue-50" }
    ];

    const engineerActions = [
        { title: "Generator Service: Lagos Branch", time: "Started: 10:00 AM", priority: "Urgent", icon: "fa-tools", color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Routine Maintenance: Head Office", time: "Scheduled: 3:00 PM", priority: "Normal", icon: "fa-calendar-check", color: "text-green-600", bg: "bg-green-50" }
    ];

    const alerts = isSales ? ["Waybill for Client X was rejected", "New Customer assigned"] : ["Overdue Job: Abuja Branch", "Report rejected by Manager"];

    // Update Stats
    if (statPendingTasks) statPendingTasks.textContent = isSales ? salesActions.length : engineerActions.length;
    if (statAlerts) statAlerts.textContent = alerts.length;

    // Configure for Role
    if (isSales) {
        if (subGreetingEl) subGreetingEl.textContent = "Focus on your customers and close those sales.";
        if (activityTitleEl) activityTitleEl.textContent = "Your Sales Actions";
        renderActionList(salesActions, "customers");
    } else if (isEngineer) {
        if (subGreetingEl) subGreetingEl.textContent = "Track your jobs and maintain system reliability.";
        if (activityTitleEl) activityTitleEl.textContent = "Assigned Maintenance Jobs";
        renderActionList(engineerActions, "jobs");
    }

    // Render Action List
    function renderActionList(actions, targetSection) {
        if (!activityListContainer) return;

        activityListContainer.innerHTML = actions.map(action => `
            <div class="flex items-center p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 cursor-pointer group">
                <div class="${action.bg} ${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl mr-4 shadow-sm">
                    <i class="fas ${action.icon}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-gray-800 group-hover:text-red-600 transition">${action.title}</h4>
                        <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded ${action.priority === 'Urgent' || action.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}">${action.priority}</span>
                    </div>
                    <p class="text-xs text-gray-500">${action.time}</p>
                </div>
                <i class="fas fa-chevron-right text-gray-300 ml-4 group-hover:text-red-400 group-hover:translate-x-1 transition-all"></i>
            </div>
        `).join("");

        // Link See All button
        if (activitySeeAllBtn) {
            activitySeeAllBtn.onclick = () => {
                window.location.hash = targetSection;
            };
        }
    }

    // Render Pending Uploads
    if (pendingUploadsList) {
        const pendingItems = isSales
            ? [{ name: "First Bank Invoice", type: "Invoice" }]
            : [{ name: "Lagos Gen Report", type: "Job Sheet" }];

        pendingUploadsList.innerHTML = pendingItems.map(item => `
            <div class="bg-gray-700/50 p-3 rounded-xl border border-gray-600 flex items-center justify-between hover:bg-gray-700 transition">
                <div>
                   <div class="text-xs font-bold text-red-400 uppercase tracking-tighter">${item.type}</div>
                   <div class="text-sm font-medium text-white">${item.name}</div>
                </div>
                <button class="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold transition">UPLOAD</button>
            </div>
        `).join("");
    }

    // Render Mini Weekly Grid
    const miniGrid = document.getElementById("weekly-mini-grid");
    if (miniGrid) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        miniGrid.innerHTML = days.map((day, i) => `
            <div class="flex-1 min-w-[100px] border border-gray-100 rounded-xl p-3 text-center ${i === 2 ? 'bg-red-50 border-red-200' : 'bg-white'}">
                <div class="text-[10px] text-gray-400 font-bold uppercase">${day}</div>
                <div class="text-lg font-black ${i === 2 ? 'text-red-600' : 'text-gray-700'}">${20 + i}</div>
                <div class="mt-1 flex justify-center gap-0.5">
                    <div class="w-1 h-1 rounded-full bg-green-500"></div>
                    <div class="w-1 h-1 rounded-full bg-gray-200"></div>
                </div>
            </div>
        `).join("");
    }
};
