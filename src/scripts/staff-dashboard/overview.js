// src/scripts/staff-dashboard/overview.js

window.initOverview = function () {
    console.log("Staff Overview initialized");

    const staffType = (localStorage.getItem("staffType") || "engineer").toLowerCase();
    const userBranch = localStorage.getItem("branch") || "Lagos";

    // Set Branch Badge
    const branchBadge = document.getElementById("branch-badge");
    if (branchBadge) branchBadge.textContent = `${userBranch} Branch`;

    // === 1. Populate KPIs ===
    function updateKPIs() {
        const allServices = window.ServiceService ? window.ServiceService.getAllServices() : [];
        const allRequests = window.RequestService ? window.RequestService.getAllRequests() : [];

        const branchServices = allServices.filter(s => s.branch === userBranch);
        const branchRequests = allRequests.filter(r => r.branch === userBranch);

        if (document.getElementById("ov-active-services"))
            document.getElementById("ov-active-services").textContent = branchServices.length;

        if (document.getElementById("ov-pending-tasks"))
            document.getElementById("ov-pending-tasks").textContent = Math.floor(Math.random() * 5) + 1;

        if (document.getElementById("ov-my-uploads"))
            document.getElementById("ov-my-uploads").textContent = Math.floor(Math.random() * 10);

        if (document.getElementById("ov-alerts"))
            document.getElementById("ov-alerts").textContent = branchRequests.filter(r => r.status === 'Pending').length;
    }

    // === 2. Navigation Logic ===
    document.querySelectorAll(".kpi-card-staff").forEach(card => {
        card.addEventListener("click", () => {
            const target = card.dataset.target;
            if (target) window.location.hash = target;
        });
    });

    // === 2. Monthly Calendar (Shared Logic) ===
    let currentUiDate = new Date();

    function renderMonthlyCalendar() {
        const gridContainer = document.getElementById("calendar-grid");
        const titleEl = document.getElementById("calendarTitle");
        if (!gridContainer || !titleEl) return;

        const year = currentUiDate.getFullYear();
        const month = currentUiDate.getMonth();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        titleEl.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Data (Filtered for branch)
        const services = window.ServiceService.getAllServices().filter(s => s.branch === userBranch);
        const requests = window.RequestService.getAllRequests().filter(r => r.branch === userBranch);

        gridContainer.innerHTML = "";

        // Empty cells
        for (let i = 0; i < firstDayOfMonth; i++) {
            gridContainer.appendChild(document.createElement("div"));
        }

        // Day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            const cell = document.createElement("div");
            cell.className = `h-24 border border-gray-100 rounded-2xl p-3 relative bg-white hover:border-red-500 transition cursor-pointer flex flex-col gap-1 shadow-sm overflow-hidden`;

            if (isToday) cell.classList.add("ring-2", "ring-red-100", "border-red-600");

            cell.innerHTML = `<span class="text-xs font-black ${isToday ? 'text-red-600' : 'text-gray-400'}">${day}</span>`;

            // Indicators
            const dayServices = services.filter(s => s.startDate === dateStr);
            if (dayServices.length > 0) {
                cell.innerHTML += `<div class="w-full h-1 bg-blue-500 rounded-full mt-auto"></div>`;
            }

            const dayRequests = requests.filter(r => r.dateSubmitted === dateStr);
            if (dayRequests.length > 0) {
                cell.innerHTML += `<div class="w-full h-1 bg-red-500 rounded-full"></div>`;
            }

            gridContainer.appendChild(cell);
        }
    }

    // === 3. Secretary Editing Logic ===
    const isSecretary = staffType === "secretary";
    const ovModal = document.getElementById("overview-edit-modal");
    const ovModalContent = document.getElementById("overview-modal-content");
    let currentEditRow = null;

    if (isSecretary) {
        console.log("Secretary mode: Enabling table edits");
        // Make rows clickable for secretary
        document.querySelectorAll("#weeklyTable tbody tr").forEach(row => {
            row.classList.add("cursor-pointer", "hover:ring-2", "hover:ring-red-100");
            row.addEventListener("click", () => {
                const day = row.cells[0].textContent;
                const axis = row.cells[1].textContent;
                const staff = row.cells[4].textContent;

                currentEditRow = row;
                document.getElementById("overview-modal-title").textContent = `Update ${day} Planning`;
                document.getElementById("ov-edit-axis").value = axis;
                document.getElementById("ov-edit-staff").value = staff;

                ovModal.classList.remove("hidden");
                setTimeout(() => ovModalContent.classList.remove("scale-95", "opacity-0"), 10);
            });
        });

        window.closeOvEditModal = () => {
            ovModalContent.classList.add("scale-95", "opacity-0");
            setTimeout(() => ovModal.classList.add("hidden"), 200);
        };

        window.saveOvCell = () => {
            if (currentEditRow) {
                currentEditRow.cells[1].textContent = document.getElementById("ov-edit-axis").value;
                currentEditRow.cells[4].textContent = document.getElementById("ov-edit-staff").value;
                closeOvEditModal();
                // In real app, we would save to a database here
            }
        };
    }

    // Bind Toggles
    const weeklyBtn = document.getElementById("weeklyBtn");
    const monthlyBtn = document.getElementById("monthlyBtn");
    const weeklyTable = document.getElementById("weeklyTable");
    const monthlyTable = document.getElementById("monthlyTable");

    if (weeklyBtn && monthlyBtn) {
        weeklyBtn.onclick = () => {
            weeklyTable.classList.remove("hidden");
            monthlyTable.classList.add("hidden");
            weeklyBtn.className = "px-6 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow-sm transition";
            monthlyBtn.className = "px-6 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-gray-100 transition";
        };

        monthlyBtn.onclick = () => {
            monthlyTable.classList.remove("hidden");
            monthlyTable.classList.add("flex");
            weeklyTable.classList.add("hidden");
            monthlyBtn.className = "px-6 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow-sm transition";
            weeklyBtn.className = "px-6 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-gray-100 transition";
            renderMonthlyCalendar();
        };
    }

    // Bind Calendar Nav
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");
    if (prevMonth) prevMonth.onclick = () => { currentUiDate.setMonth(currentUiDate.getMonth() - 1); renderMonthlyCalendar(); };
    if (nextMonth) nextMonth.onclick = () => { currentUiDate.setMonth(currentUiDate.getMonth() + 1); renderMonthlyCalendar(); };

    // Initial Load
    updateKPIs();
    renderMonthlyCalendar();
};
