window.initCustomers = function () {
    console.log("Sales Customers module initialized");

    const grid = document.getElementById("my-customers-grid");
    const searchInput = document.getElementById("customer-search");

    // Mock Assigned Customers
    const myCustomers = [
        { id: 1, name: "First Bank Plc", contact: "Jane Smith", status: "Active", lastVisit: "Jan 15, 2024", icon: "fa-building-columns", color: "text-blue-600", bg: "bg-blue-50" },
        { id: 2, name: "TechSolutions Ltd", contact: "John Doe", status: "Issue", lastVisit: "Jan 20, 2024", icon: "fa-microchip", color: "text-red-600", bg: "bg-red-50" },
        { id: 3, name: "Global Logistics", contact: "Mike Ross", status: "Pending", lastVisit: "Never", icon: "fa-truck-fast", color: "text-purple-600", bg: "bg-purple-50" }
    ];

    function renderCustomers(filter = "") {
        if (!grid) return;

        const filtered = myCustomers.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

        grid.innerHTML = filtered.map(c => `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group overflow-hidden relative">
                <div class="absolute -right-4 -top-4 w-24 h-24 ${c.bg} rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                
                <div class="relative">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 ${c.bg} ${c.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            <i class="fas ${c.icon}"></i>
                        </div>
                        <span class="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${c.status}</span>
                    </div>
                    
                    <h3 class="text-xl font-black text-gray-800 mb-1">${c.name}</h3>
                    <p class="text-sm text-gray-500 font-medium mb-4 flex items-center gap-2">
                        <i class="fas fa-user-tie text-gray-300"></i> ${c.contact}
                    </p>
                    
                    <div class="flex items-center gap-4 text-xs text-gray-400 mb-6 bg-gray-50 p-2 rounded-xl">
                        <div class="flex items-center gap-1">
                            <i class="fas fa-history"></i>
                            <span>Last Visit: <b>${c.lastVisit}</b></span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <button class="upload-trigger py-3 rounded-2xl bg-gray-800 text-white text-xs font-bold hover:bg-black transition flex items-center justify-center gap-2" data-name="${c.name}">
                            <i class="fas fa-cloud-upload-alt"></i> Upload
                        </button>
                        <button class="py-3 rounded-2xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

        // Handle Upload Button Clicks
        document.querySelectorAll(".upload-trigger").forEach(btn => {
            btn.onclick = () => {
                const customerName = btn.dataset.name;
                openUploadModal(customerName);
            };
        });
    }

    function openUploadModal(customerName) {
        const modal = document.getElementById("upload-modal-overlay");
        const title = document.getElementById("upload-modal-target");
        if (modal && title) {
            title.textContent = `Target: ${customerName}`;
            modal.classList.remove("hidden");
        }
    }

    // Modal Close
    document.querySelectorAll(".close-upload-modal").forEach(btn => {
        btn.onclick = () => {
            document.getElementById("upload-modal-overlay").classList.add("hidden");
        };
    });

    if (searchInput) {
        searchInput.oninput = (e) => renderCustomers(e.target.value);
    }

    renderCustomers();
};
