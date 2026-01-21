// src/scripts/staff-dashboard/activities.js
window.initActivities = function () {
    console.log("Values loaded for Activities");

    // Context
    const userBranch = localStorage.getItem("branch") || "Lagos";
    document.getElementById("activity-branch-display").textContent = userBranch;

    // DOM
    const weekGrid = document.getElementById("week-grid");
    const tasksContainer = document.getElementById("tasks-container");
    const selectedDayLabel = document.getElementById("selected-day-label");

    // Mock Data
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    // In a real app, calculate actual dates relative to "current week start"
    const mockDates = [23, 24, 25, 26, 27];
    let activeIndex = 0; // Default to Monday

    // Mock Tasks Repository
    const tasks = {
        0: [ // Mon
            { title: "Generator Maintenance - Client A", time: "09:00 AM", type: "Job", status: "Pending" },
            { title: "Site Inspection - Lekki", time: "02:00 PM", type: "Inspection", status: "In Progress" }
        ],
        1: [ // Tue
            { title: "Technical Report Writing", time: "11:00 AM", type: "Admin", status: "Pending" }
        ],
        2: [], // Wed
        3: [ // Thu
            { title: "Delivery to Abuja Branch", time: "08:00 AM", type: "Logistics", status: "Pending" }
        ],
        4: [ // Fri
            { title: "Weekly Team Meeting", time: "04:00 PM", type: "Meeting", status: "Confirmed" }
        ]
    };

    // Render Week Grid
    function renderGrid() {
        weekGrid.innerHTML = "";
        weekDays.forEach((day, index) => {
            const date = mockDates[index];
            const isActive = index === activeIndex;

            const el = document.createElement("div");
            el.className = `cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center transition hover:shadow-md ${isActive
                    ? "bg-red-600 text-white border-red-600 shadow-md transform scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                }`;

            el.innerHTML = `
                <span class="text-xs font-medium uppercase opacity-80">${day}</span>
                <span class="text-2xl font-bold">${date}</span>
                <span class="text-xs mt-1 ${isActive ? 'text-red-200' : 'text-gray-400'}">Jan</span>
            `;

            el.onclick = () => {
                activeIndex = index;
                renderGrid();
                renderTasks();
            };

            weekGrid.appendChild(el);
        });
    }

    // Render Tasks
    function renderTasks() {
        const dailyTasks = tasks[activeIndex] || [];
        const dayName = weekDays[activeIndex];

        selectedDayLabel.textContent = `${dayName}, Jan ${mockDates[activeIndex]}`;

        if (dailyTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <i class="fas fa-coffee text-4xl mb-3 opacity-50"></i>
                    <p>No activities scheduled for this day.</p>
                </div>`;
            return;
        }

        tasksContainer.innerHTML = dailyTasks.map(task => `
            <div class="flex items-center p-4 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition group">
                <!-- Time Box -->
                <div class="flex-shrink-0 w-20 text-center border-r border-gray-100 pr-4 mr-4">
                    <span class="block text-gray-800 font-bold">${task.time.split(' ')[0]}</span>
                    <span class="block text-xs text-gray-500 uppercase">${task.time.split(' ')[1]}</span>
                </div>

                <!-- Info -->
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-wide">${task.type}</span>
                        <span class="text-xs font-medium ${task.status === 'Pending' ? 'text-orange-500' : 'text-blue-500'}">${task.status}</span>
                    </div>
                    <h4 class="text-lg font-medium text-gray-800 group-hover:text-red-600 transition">${task.title}</h4>
                </div>

                <!-- Action -->
                <button class="ml-4 h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `).join("");
    }

    // Init
    renderGrid();
    renderTasks();
};
