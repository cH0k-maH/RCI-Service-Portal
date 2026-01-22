// src/scripts/staff-dashboard/logistics-docs.js

window.initLogisticsDocs = function () {
    console.log("Logistics Docs initialized");

    const docsGrid = document.getElementById("docs-grid");

    const docs = [
        { id: "DOC-101", name: "Waybill - Lekki Delivery", type: "Waybill", date: "2024-01-20", status: "Approved" },
        { id: "DOC-102", name: "Fuel Receipt - Jan 18", type: "Receipt", date: "2024-01-18", status: "Pending" },
        { id: "DOC-103", name: "Job Card - V.I Maintenance", type: "Other", date: "2024-01-15", status: "Approved" },
        { id: "DOC-104", name: "Fuel Receipt - Jan 12", type: "Receipt", date: "2024-01-12", status: "Queried" }
    ];

    function renderDocs() {
        if (!docsGrid) return;
        docsGrid.innerHTML = docs.map(doc => `
            <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-lg transition">
                <div class="w-full h-32 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                    <i class="fas ${doc.type === 'Receipt' ? 'fa-file-invoice-dollar' : 'fa-file-contract'} text-3xl text-gray-200 group-hover:scale-110 transition duration-500"></i>
                    <div class="absolute top-2 right-2 px-2 py-1 ${doc.status === 'Approved' ? 'bg-green-50 text-green-600' : doc.status === 'Pending' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'} rounded-lg text-[8px] font-black uppercase tracking-widest border border-current opacity-80">${doc.status}</div>
                </div>
                <h4 class="text-sm font-black text-gray-800 tracking-tight truncate mb-1">${doc.name}</h4>
                <div class="flex items-center justify-between">
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${doc.type}</span>
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${doc.date}</span>
                </div>
            </div>
        `).join('');
    }

    renderDocs();
};
