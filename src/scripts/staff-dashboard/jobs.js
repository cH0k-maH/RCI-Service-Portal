window.initJobs = function () {
    console.log("Engineer Jobs module initialized");

    const queue = document.getElementById("jobs-queue");

    // Mock Assigned Jobs
    const myJobs = [
        { id: 101, customer: "Lagos Govt House", type: "Gen Maintenance", status: "In Progress", priority: "Urgent", time: "Started 2h ago", icon: "fa-bolt", color: "text-orange-600", bg: "bg-orange-50" },
        { id: 102, customer: "First Bank (Marina)", type: "AC Repair", status: "Assigned", priority: "Normal", time: "Sch: 1:30 PM", icon: "fa-snowflake", color: "text-blue-600", bg: "bg-blue-50" },
        { id: 103, customer: "Chevron HQ", type: "Electrical Audit", status: "Pending", priority: "High", time: "Sch: Tomorrow", icon: "fa-shield-halved", color: "text-red-600", bg: "bg-red-50" }
    ];

    function renderJobs() {
        if (!queue) return;

        queue.innerHTML = myJobs.map(job => `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition">
                <div class="w-16 h-16 ${job.bg} ${job.color} rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    <i class="fas ${job.icon}"></i>
                </div>
                
                <div class="flex-1 text-center md:text-left">
                    <div class="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1">
                        <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${job.priority === 'Urgent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}">${job.priority}</span>
                        <span class="text-xs font-bold text-gray-400 capitalize">${job.type}</span>
                    </div>
                    <h3 class="text-xl font-black text-gray-800">${job.customer}</h3>
                    <p class="text-sm text-gray-500 font-medium">${job.time}</p>
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <button class="flex-1 md:flex-none px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-md shadow-red-100">
                        ${job.status === 'In Progress' ? 'LOG ACTION' : 'START JOB'}
                    </button>
                    <button class="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-gray-800 transition">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        `).join("");
    }

    renderJobs();
};
