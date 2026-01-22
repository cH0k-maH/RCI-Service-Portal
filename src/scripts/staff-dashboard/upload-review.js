// src/scripts/staff-dashboard/upload-review.js

window.initUploadReview = function () {
    console.log("Secretary Upload Review initialized");

    const reviewRows = document.getElementById("review-rows");

    const pendingUploads = [
        { id: 1, date: "2024-01-22", staff: "John (Engineer)", type: "Installation Photo", file: "ac-install.jpg" },
        { id: 2, date: "2024-01-22", staff: "Sarah (Sales)", type: "Client Site Form", file: "visit-report.pdf" },
        { id: 3, date: "2024-01-21", staff: "Dan (Driver)", type: "Fuel Receipt", file: "fuel-901.jpg" },
        { id: 4, date: "2024-01-21", staff: "Mike (Sales)", type: "Order Confirmation", file: "order-22.pdf" }
    ];

    function renderReview() {
        if (!reviewRows) return;
        reviewRows.innerHTML = pendingUploads.map(upload => `
            <tr class="hover:bg-gray-50 transition group">
                <td class="p-4 text-xs font-bold text-gray-400 font-mono">${upload.date}</td>
                <td class="p-4 font-black text-gray-800">${upload.staff}</td>
                <td class="p-4"><span class="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">${upload.type}</span></td>
                <td class="p-4 text-blue-600 font-bold text-xs"><i class="fas fa-file-alt mr-1"></i> ${upload.file}</td>
                <td class="p-4">
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button class="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Verify"><i class="fas fa-check"></i></button>
                        <button class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Flag Error"><i class="fas fa-flag"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderReview();
};
