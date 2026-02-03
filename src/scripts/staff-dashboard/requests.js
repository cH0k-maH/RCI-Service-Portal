window.initRequests = async function () {
    console.log("Queries initialized");
    const queriesList = document.getElementById("queries-list");
    const noQueriesMsg = document.getElementById("no-queries-msg");
    const userId = localStorage.getItem("userId");

    async function renderQueries() {
        // Fetch official queries from backend
        let myQueries = [];
        if (userId) {
            const res = await window.AdminToolService.getStaffQueries(userId);
            myQueries = res || [];
        }

        // Clear list
        const items = queriesList.querySelectorAll(".query-card");
        items.forEach(item => item.remove());

        if (myQueries.length === 0) {
            noQueriesMsg.classList.remove("hidden");
        } else {
            noQueriesMsg.classList.add("hidden");
            myQueries.forEach(q => {
                const card = document.createElement("div");
                card.className = "query-card bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 animate-fadeIn cursor-pointer hover:border-red-600 transition-all";

                const dateStr = q.created_at ? new Date(q.created_at).toLocaleDateString() : 'N/A';
                const status = (q.status || 'Active').toUpperCase();
                const statusColor = status === 'RESOLVED' ? 'text-green-600' : 'text-red-600';

                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-gray-800">${q.title}</h4>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] text-gray-400 font-mono">${dateStr}</span>
                            <span class="text-[9px] font-bold ${statusColor}">${status}</span>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">${q.reason}</p>
                    <div class="flex justify-between items-center text-xs">
                        <div class="text-gray-400 italic">Issued by: Administrator</div>
                        <button class="text-red-600 font-bold hover:underline">Acknowledge Receipt</button>
                    </div>
                `;
                queriesList.appendChild(card);
            });
        }
    }

    renderQueries();
};
