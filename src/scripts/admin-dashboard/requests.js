// src/scripts/admin-dashboard/requests.js

window.initRequests = function () {
    console.log("Requests Management initialized");
    if (localStorage.getItem("userRole") !== "admin") return;

    // === UI Elements ===
    const tableBody = document.getElementById("requests-table-body");
    const noDataMsg = document.getElementById("no-requests-msg");
    const searchInput = document.getElementById("req-search");
    const branchFilter = document.getElementById("req-branch-filter");
    const typeFilter = document.getElementById("req-type-filter");
    const kpiCards = document.querySelectorAll("#req-kpi-container .kpi-card");

    // Modal Elements
    const modalOverlay = document.getElementById("request-modal-overlay");
    const modalTitle = document.getElementById("req-modal-title");
    const closeBtn = document.getElementById("close-req-modal");

    // Modal Content
    const reqIdInput = document.getElementById("req-id");
    const reqBy = document.getElementById("req-by");
    const reqType = document.getElementById("req-type");
    const reqPriority = document.getElementById("req-priority-badge");
    const reqDate = document.getElementById("req-date");
    const reqDesc = document.getElementById("req-desc");
    const reqNotes = document.getElementById("req-notes");
    const reqRejectReason = document.getElementById("req-reject-reason");
    const rejectionSection = document.getElementById("rejection-section");
    const actionButtons = document.getElementById("action-buttons");
    const statusDisplay = document.getElementById("status-display");
    const btnApprove = document.getElementById("btn-approve");
    const btnReject = document.getElementById("btn-reject");

    // State
    let currentKpiFilter = "Pending"; // Default to Pending for Requests
    let currentRequest = null;

    // === 1. KPI Logic ===
    function updateKpiCards() {
        const stats = window.RequestService.getStats();
        document.getElementById("kpi-req-total").textContent = stats.total;
        document.getElementById("kpi-req-pending").textContent = stats.pending;
        document.getElementById("kpi-req-approved").textContent = stats.approved;
        document.getElementById("kpi-req-rejected").textContent = stats.rejected;
    }

    kpiCards.forEach(card => {
        card.addEventListener("click", () => {
            kpiCards.forEach(c => c.classList.remove("ring-2", "ring-offset-2", "ring-gray-400"));
            card.classList.add("ring-2", "ring-offset-2", "ring-gray-400");
            currentKpiFilter = card.dataset.filter;
            renderTable();
        });
    });

    // === 2. Render Table ===
    function renderTable() {
        const allRequests = window.RequestService.getAllRequests();
        const searchTerm = searchInput.value.toLowerCase();
        const branchTerm = branchFilter.value;
        const typeTerm = typeFilter.value;

        const filtered = allRequests.filter(r => {
            if (currentKpiFilter !== "All" && r.status !== currentKpiFilter) return false;

            const textMatch = (r.clientName || "").toLowerCase().includes(searchTerm) ||
                String(r.id).includes(searchTerm) ||
                (r.requestedBy || "").toLowerCase().includes(searchTerm);
            if (!textMatch) return false;

            if (branchTerm && r.branch !== branchTerm) return false;
            if (typeTerm && r.type !== typeTerm) return false;

            return true;
        });

        tableBody.innerHTML = "";

        if (filtered.length === 0) {
            noDataMsg.classList.remove("hidden");
        } else {
            noDataMsg.classList.add("hidden");

            filtered.forEach(r => {
                const tr = document.createElement("tr");
                tr.className = "hover:bg-gray-50 transition cursor-pointer group";
                tr.onclick = () => openModal(r);

                // Priority Color
                let priColor = "bg-gray-100 text-gray-600";
                if (r.priority === 'High') priColor = "bg-red-100 text-red-700";
                if (r.priority === 'Medium') priColor = "bg-orange-100 text-orange-700";
                if (r.priority === 'Low') priColor = "bg-green-100 text-green-700";

                // Status Color
                let statusColor = "text-gray-500";
                if (r.status === 'Pending') statusColor = "text-red-500 font-bold";
                if (r.status === 'Approved') statusColor = "text-green-600";
                if (r.status === 'Rejected') statusColor = "text-gray-400";

                tr.innerHTML = `
                  <td class="px-6 py-4 whitespace-nowrap">
                       <span class="px-2 py-1 text-xs font-bold rounded ${priColor}">${r.priority}</span>
                  </td>
                  <td class="px-6 py-4">
                      <div class="text-sm font-bold text-gray-900">#${r.id}</div>
                      <div class="text-xs text-gray-500">${r.type}</div>
                  </td>
                  <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">${r.requestedBy}</div>
                      <div class="text-xs text-gray-500">${r.clientName || '-'}</div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">${r.branch}</td>
                  <td class="px-6 py-4 text-xs text-gray-500">${r.dateSubmitted}</td>
                  <td class="px-6 py-4 text-sm ${statusColor}">${r.status}</td>
                  <td class="px-6 py-4 text-center">
                      <button class="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1 rounded">View</button>
                  </td>
              `;
                tableBody.appendChild(tr);
            });
        }
        updateKpiCards();
    }

    // === 3. Modal Logic ===
    function openModal(request) {
        if (!request) return;
        currentRequest = request;
        modalOverlay.classList.remove("hidden");

        // Populate Data
        reqIdInput.value = request.id;
        reqBy.textContent = request.requestedBy;
        reqType.textContent = request.type;
        reqDate.textContent = request.dateSubmitted;
        reqDesc.textContent = request.description;
        reqNotes.value = request.notes || "";
        reqRejectReason.value = request.rejectionReason || "";

        // Priority Badge Style
        reqPriority.textContent = request.priority.toUpperCase();
        reqPriority.className = "px-2 py-1 rounded text-xs font-bold " +
            (request.priority === 'High' ? "bg-red-100 text-red-700" :
                request.priority === 'Medium' ? "bg-orange-100 text-orange-700" :
                    "bg-green-100 text-green-700");

        // State Logic (Pending vs Approved/Rejected)
        if (request.status === "Pending") {
            actionButtons.classList.remove("hidden");
            statusDisplay.classList.add("hidden");
            rejectionSection.classList.add("hidden");
            reqRejectReason.readOnly = false;
            reqNotes.readOnly = false;
        } else {
            actionButtons.classList.add("hidden");
            statusDisplay.classList.remove("hidden");

            if (request.status === "Approved") {
                statusDisplay.textContent = "✅ APPROVED";
                statusDisplay.className = "font-bold text-lg text-green-600";
                rejectionSection.classList.add("hidden");
            } else {
                statusDisplay.textContent = "❌ REJECTED";
                statusDisplay.className = "font-bold text-lg text-gray-500";
                rejectionSection.classList.remove("hidden");
            }
            reqRejectReason.readOnly = true;
            reqNotes.readOnly = true;
        }
    }

    function closeModal() {
        modalOverlay.classList.add("hidden");
        currentRequest = null;
    }

    // === 4. Actions (Approve/Reject) ===

    btnApprove.addEventListener("click", () => {
        if (!currentRequest) return;
        if (confirm("Approve this request? This may trigger a new Service ticket.")) {

            // 1. Update Request
            window.RequestService.updateRequest(currentRequest.id, {
                status: "Approved",
                notes: reqNotes.value
            });

            // 2. Trigger Service Creation (if it's a Service Request)
            if (currentRequest.type === "Service Request") {
                window.ServiceService.addService({
                    clientName: currentRequest.clientName,
                    type: "Maintenance", // Default, could be inferred
                    branch: currentRequest.branch,
                    engineer: "Unassigned",
                    description: `Generated from Request #${currentRequest.id}: ${currentRequest.description}`,
                    status: "Pending",
                    startDate: new Date().toISOString().split('T')[0]
                });
                alert("Request Approved! A new Pending Service has been created.");
            } else {
                alert("Request Approved!");
            }

            closeModal();
            renderTable();
        }
    });

    btnReject.addEventListener("click", () => {
        // 1. Check if reason is open
        if (rejectionSection.classList.contains("hidden")) {
            // Show rejection box first
            rejectionSection.classList.remove("hidden");
            reqRejectReason.focus();
            return;
        }

        // 2. Validate reason
        const reason = reqRejectReason.value.trim();
        if (!reason) {
            alert("Please provide a rejection reason.");
            return;
        }

        // 3. Reject
        if (confirm("Reject this request?")) {
            window.RequestService.updateRequest(currentRequest.id, {
                status: "Rejected",
                rejectionReason: reason,
                notes: reqNotes.value
            });
            alert("Request Rejected.");
            closeModal();
            renderTable();
        }
    });


    // === 5. Event Listeners ===
    searchInput.addEventListener("input", renderTable);
    branchFilter.addEventListener("change", renderTable);
    typeFilter.addEventListener("change", renderTable);
    closeBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

    // Init
    renderTable();
};
