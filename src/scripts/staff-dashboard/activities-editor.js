// src/scripts/staff-dashboard/activities-editor.js

window.initActivitiesEditor = function () {
    console.log("Secretary Activities Editor initialized");

    const weeklyRows = document.getElementById("sec-weekly-rows");
    const modal = document.getElementById("edit-cell-modal");
    const modalContent = document.getElementById("edit-modal-content");

    let currentEditDay = null;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    let mockData = {}; // Will be populated from backend

    async function loadWeeklyRoster() {
        try {
            const res = await fetch('http://localhost:5000/api/activities/weekly');
            const data = await res.json();
            // Backend returns object keyed by Day, if empty use mocks or empty
            if (Object.keys(data).length > 0) {
                mockData = data;
            } else {
                // Default structure if empty
                mockData = {
                    "Monday": { axis: "Not Set", staff: "None" },
                    "Tuesday": { axis: "Not Set", staff: "None" },
                    "Wednesday": { axis: "Not Set", staff: "None" },
                    "Thursday": { axis: "Not Set", staff: "None" },
                    "Friday": { axis: "Not Set", staff: "None" }
                };
            }
            renderWeekly();
        } catch (e) {
            console.error("Failed to load roster", e);
        }
    }

    function renderWeekly() {
        if (!weeklyRows) return;
        weeklyRows.innerHTML = days.map(day => {
            const dayData = mockData[day] || { axis: "-", staff: "-" };
            return `
            <tr class="hover:bg-gray-50 transition cursor-pointer group">
                <td class="p-4 font-black text-gray-800">${day}</td>
                <td class="p-4 text-sm text-gray-500 font-medium italic">${dayData.axis}</td>
                <td class="p-4 text-xs text-gray-400">${dayData.staff}</td>
                <td class="p-4">
                    <button onclick="openEditModal('${day}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `}).join('');
    }

    window.openEditModal = (day) => {
        currentEditDay = day;
        const dayData = mockData[day] || { axis: "", staff: "" };

        document.getElementById("edit-modal-title").textContent = `Edit ${day}`;
        document.getElementById("edit-axis").value = dayData.axis;
        document.getElementById("edit-staff").value = dayData.staff;

        modal.classList.remove("hidden");
        setTimeout(() => modalContent.classList.remove("scale-95", "opacity-0"), 10);
    };

    window.closeEditModal = () => {
        modalContent.classList.add("scale-95", "opacity-0");
        setTimeout(() => modal.classList.add("hidden"), 200);
    };

    window.saveCell = async () => {
        if (currentEditDay) {
            const axis = document.getElementById("edit-axis").value;
            const staff = document.getElementById("edit-staff").value;

            // Optimistic UI Update
            if (!mockData[currentEditDay]) mockData[currentEditDay] = {};
            mockData[currentEditDay].axis = axis;
            mockData[currentEditDay].staff = staff;
            renderWeekly();
            closeEditModal();

            // Persist
            try {
                await fetch('http://localhost:5000/api/activities/weekly', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ day: currentEditDay, axis, staff })
                });
                window.ToastService.success("Roster updated");
            } catch (e) {
                console.error("Failed to save roster", e);
                window.ToastService.error("Failed to save changes");
            }
        }
    };

    // Toggles
    document.getElementById("secWeeklyBtn").onclick = () => {
        document.getElementById("secWeeklyView").classList.remove("hidden");
        document.getElementById("secMonthlyView").classList.add("hidden");
        document.getElementById("secWeeklyBtn").className = "px-6 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow-sm transition";
        document.getElementById("secMonthlyBtn").className = "px-6 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-gray-100 transition";
    };

    document.getElementById("secMonthlyBtn").onclick = () => {
        document.getElementById("secWeeklyView").classList.add("hidden");
        document.getElementById("secMonthlyView").classList.remove("hidden");
        document.getElementById("secMonthlyView").classList.add("flex");
        document.getElementById("secMonthlyBtn").className = "px-6 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow-sm transition";
        document.getElementById("secWeeklyBtn").className = "px-6 py-2 text-xs font-bold rounded-xl text-gray-500 hover:bg-gray-100 transition";
    };

    loadWeeklyRoster();
};
