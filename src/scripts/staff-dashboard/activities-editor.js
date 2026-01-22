// src/scripts/staff-dashboard/activities-editor.js

window.initActivitiesEditor = function () {
    console.log("Secretary Activities Editor initialized");

    const weeklyRows = document.getElementById("sec-weekly-rows");
    const modal = document.getElementById("edit-cell-modal");
    const modalContent = document.getElementById("edit-modal-content");

    let currentEditDay = null;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const mockData = {
        "Monday": { axis: "Lekki / Ajah", staff: "Sarah, John" },
        "Tuesday": { axis: "Ikeja / Gbagada", staff: "Peter, Paul" },
        "Wednesday": { axis: "Victoria Island", staff: "Mike, John" },
        "Thursday": { axis: "Apapa / Surulere", staff: "Emmanuel" },
        "Friday": { axis: "Office Day", staff: "All Staff" }
    };

    function renderWeekly() {
        if (!weeklyRows) return;
        weeklyRows.innerHTML = days.map(day => `
            <tr class="hover:bg-gray-50 transition cursor-pointer group">
                <td class="p-4 font-black text-gray-800">${day}</td>
                <td class="p-4 text-sm text-gray-500 font-medium italic">${mockData[day].axis}</td>
                <td class="p-4 text-xs text-gray-400">${mockData[day].staff}</td>
                <td class="p-4">
                    <button onclick="openEditModal('${day}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.openEditModal = (day) => {
        currentEditDay = day;
        document.getElementById("edit-modal-title").textContent = `Edit ${day}`;
        document.getElementById("edit-axis").value = mockData[day].axis;
        document.getElementById("edit-staff").value = mockData[day].staff;

        modal.classList.remove("hidden");
        setTimeout(() => modalContent.classList.remove("scale-95", "opacity-0"), 10);
    };

    window.closeEditModal = () => {
        modalContent.classList.add("scale-95", "opacity-0");
        setTimeout(() => modal.classList.add("hidden"), 200);
    };

    window.saveCell = () => {
        if (currentEditDay) {
            mockData[currentEditDay].axis = document.getElementById("edit-axis").value;
            mockData[currentEditDay].staff = document.getElementById("edit-staff").value;
            renderWeekly();
            closeEditModal();
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

    renderWeekly();
};
