// src/scripts/client-dashboard/overview.js

window.initOverview = function () {
    console.log("Client Overview initialized");

    const staffType = (localStorage.getItem("staffType") || "customer").toLowerCase();
    const userName = localStorage.getItem("userName") || "Client";

    document.getElementById("ov-user-name").textContent = userName.split(" ")[0];

    const kpiContainer = document.getElementById("client-kpis");
    const requestsList = document.getElementById("active-requests-list");
    const contextCard = document.getElementById("ov-context-card");

    // 1. RENDER ROLE-SPECIFIC KPIs
    const kpis = {
        dealer: [
            { label: "Active Requests", val: "4", icon: "fa-file-signature", color: "red" },
            { label: "Unpaid Invoices", val: "2", icon: "fa-invoice-dollar", color: "orange" },
            { label: "Completed Services", val: "28", icon: "fa-check-double", color: "green" },
            { label: "Credit Used", val: "45%", icon: "fa-chart-pie", color: "blue" }
        ],
        customer: [
            { label: "Current Status", val: "In Service", icon: "fa-tools", color: "orange" },
            { label: "Last Service", val: "12 Days ago", icon: "fa-calendar-check", color: "green" },
            { label: "Open Tickets", val: "1", icon: "fa-comment-dots", color: "blue" },
            { label: "Pending Counter", val: "Jan 24", icon: "fa-tachometer-alt", color: "red" }
        ]
    };

    const currentKpis = kpis[staffType] || kpis.customer;
    kpiContainer.innerHTML = currentKpis.map(kpi => `
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition">
            <div class="w-12 h-12 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                <i class="fas ${kpi.icon}"></i>
            </div>
            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${kpi.label}</h4>
            <p class="text-3xl font-black text-gray-900 tracking-tighter">${kpi.val}</p>
        </div>
    `).join('');

    // 2. RENDER ACTIVE REQUESTS (Mock)
    const requests = [
        { id: "REQ-901", type: "Generator Maintenance", status: "In Progress", date: "Jan 21", progress: 65 },
        { id: "REQ-882", type: "AC Installation", status: "Under Review", date: "Jan 22", progress: 20 }
    ];

    requestsList.innerHTML = requests.map(req => `
        <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-red-200 transition group cursor-pointer">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">${req.id} • ${req.date}</span>
                    <h4 class="text-lg font-black text-gray-800 tracking-tight">${req.type}</h4>
                </div>
                <span class="px-3 py-1 ${req.status === 'In Progress' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'} rounded-lg text-[10px] font-black uppercase tracking-widest">${req.status}</span>
            </div>
            
            <div class="mt-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                    <span class="text-[10px] font-black text-gray-800">${req.progress}%</span>
                </div>
                <div class="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div class="bg-red-600 h-full rounded-full transition-all duration-1000" style="width: ${req.progress}%"></div>
                </div>
            </div>
        </div>
    `).join('');

    // 3. RENDER CONTEXT CARD
    if (staffType === 'dealer') {
        contextCard.innerHTML = `
            <h3 class="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">Partner Account</h3>
            <div class="space-y-6">
                <div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                    <p class="text-2xl font-black text-gray-900 tracking-tighter">₦1,250,400.00</p>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl">
                    <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                        <span class="text-gray-400">Credit Limit</span>
                        <span class="text-gray-800">₦2,500,000</span>
                    </div>
                    <div class="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div class="bg-indigo-600 h-full w-1/2"></div>
                    </div>
                </div>
            </div>
            <button class="w-full mt-8 py-3 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-800 transition shadow-lg shadow-slate-200">Request Statement</button>
        `;
    } else {
        contextCard.innerHTML = `
            <h3 class="text-lg font-black text-gray-800 uppercase tracking-tight mb-6">My Machines</h3>
            <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition cursor-pointer">
                    <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><i class="fas fa-cog"></i></div>
                    <div>
                        <p class="text-sm font-black text-gray-800">Pramac GSW 22</p>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SN: 2023-X991</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition cursor-pointer">
                    <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><i class="fas fa-cog"></i></div>
                    <div>
                        <p class="text-sm font-black text-gray-800">Daikin VRV System</p>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SN: DX-122-88</p>
                    </div>
                </div>
            </div>
            <button data-section="counter" class="w-full mt-8 py-3 border-2 border-gray-50 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:border-red-100 hover:text-red-600 transition">Update Counter Readings</button>
        `;
    }
};
