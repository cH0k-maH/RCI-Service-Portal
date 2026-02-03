window.initTasks = async function () {
    console.log("My Tasks initialized");
    const tasksList = document.getElementById("tasks-list");
    const noTasksMsg = document.getElementById("no-tasks-msg");
    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    async function renderTasks() {
        // 1. Fetch Service Requests (Existing logic/local)
        const allServices = window.ServiceService.getAllServices();
        const serviceTasks = allServices.filter(s => s.engineer === userName);

        // 2. Fetch Directly Assigned Staff Tasks (New Backend API)
        let directTasks = [];
        if (userId) {
            const res = await window.AdminToolService.getStaffTasks(userId);
            directTasks = res || [];
        }

        // Clear list (except the no-tasks message)
        const items = tasksList.querySelectorAll(".task-card");
        items.forEach(item => item.remove());

        const totalTasks = serviceTasks.length + directTasks.length;

        if (totalTasks === 0) {
            noTasksMsg.classList.remove("hidden");
        } else {
            noTasksMsg.classList.add("hidden");

            // Render Service Tasks
            serviceTasks.forEach(task => {
                renderTaskCard(task, 'service');
            });

            // Render Direct Tasks
            directTasks.forEach(task => {
                renderTaskCard(task, 'direct');
            });
        }
    }

    function renderTaskCard(task, category) {
        const card = document.createElement("div");
        card.className = "task-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-red-200 transition-all animate-fadeIn";

        let statusClass = "bg-gray-100 text-gray-600";
        const status = task.status || 'Pending';
        if (status === 'Active' || status === 'In Progress') statusClass = "bg-blue-100 text-blue-700";
        if (status === 'Pending') statusClass = "bg-yellow-100 text-yellow-700";
        if (status === 'Completed') statusClass = "bg-green-100 text-green-700";

        const isDirect = category === 'direct';
        const title = isDirect ? task.title : task.clientName;
        const subtitle = isDirect ? `Priority: ${task.priority}` : task.type;
        const description = task.description;
        const dateLabel = isDirect ? 'Due' : 'Started';
        const dateValue = isDirect ? (task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A') : task.startDate;
        const idPrefix = isDirect ? 'DT' : '#';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="text-xs font-bold text-gray-400 font-mono tracking-tighter">${idPrefix}${task.id}</span>
                    <h4 class="text-lg font-bold text-gray-800">${title}</h4>
                    <p class="text-sm text-gray-500">${subtitle}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${statusClass}">${status}</span>
                    ${isDirect ? `<span class="text-[9px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded">Admin Assigned</span>` : ''}
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">${description}</p>
            <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                <div class="text-xs text-gray-400">
                    <i class="far fa-calendar-alt mr-1"></i> ${dateLabel}: ${dateValue}
                </div>
                <button class="text-red-600 font-bold text-sm hover:underline" onclick="window.ToastService.info('Task details view coming soon!')">
                    Update Progress
                </button>
            </div>
        `;
        tasksList.appendChild(card);
    }

    renderTasks();
};
