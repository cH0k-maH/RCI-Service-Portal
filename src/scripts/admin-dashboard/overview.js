// src/scripts/admin-dashboard/overview.js

window.initOverview = function () {
  const role = localStorage.getItem("userRole") || "guest";

  /* KPI CARDS */
  document.querySelectorAll(".kpi-card").forEach(card => {
    card.addEventListener("click", () => {
      alert(`Details for ${card.dataset.target} (table/modal later)`);
    });
  });

  /* WEEKLY / MONTHLY TOGGLE */
  const weeklyBtn = document.getElementById("weeklyBtn");
  const monthlyBtn = document.getElementById("monthlyBtn");
  const weeklyTable = document.getElementById("weeklyTable");
  const monthlyTable = document.getElementById("monthlyTable");

  weeklyBtn.addEventListener("click", () => {
    weeklyTable.classList.remove("hidden");
    monthlyTable.classList.add("hidden");
    weeklyBtn.classList.add("bg-red-600", "text-white");
    monthlyBtn.classList.remove("bg-red-600", "text-white");
  });

  monthlyBtn.addEventListener("click", () => {
    monthlyTable.classList.remove("hidden");
    weeklyTable.classList.add("hidden");
    monthlyBtn.classList.add("bg-red-600", "text-white");
    weeklyBtn.classList.remove("bg-red-600", "text-white");
  });

  /* DAY ROW CLICK */
  document.querySelectorAll(".day-row").forEach(row => {
    row.addEventListener("click", () => {
      if (role === "admin") {
        alert(
          "ADMIN MODE\n\n• View\n• Edit\n• Approve\n• Manage uploads"
        );
      } else {
        alert(
          "STAFF MODE\n\n• Upload job sheet\n• Upload invoice\n• Upload waybill"
        );
      }
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
   const weeklyBtn = document.getElementById("weeklyBtn");
   const monthlyBtn = document.getElementById("monthlyBtn");
   const weeklyTable = document.getElementById("weeklyTable");
   const monthlyTable = document.getElementById("monthlyTable");

   weeklyBtn.addEventListener("click", () => {
    weeklyTable.classList.remove("hidden");
    monthlyTable.classList.add("hidden");

    weeklyBtn.classList.add("bg-red-600", "text-white");
    weeklyBtn.classList.remove("bg-gray-200", "text-gray-700");

    monthlyBtn.classList.remove("bg-red-600", "text-white");
    monthlyBtn.classList.add("bg-gray-200", "text-gray-700");
  });

  monthlyBtn.addEventListener("click", () => {
    monthlyTable.classList.remove("hidden");
    weeklyTable.classList.add("hidden");

    monthlyBtn.classList.add("bg-red-600", "text-white");
    monthlyBtn.classList.remove("bg-gray-200", "text-gray-700");

    weeklyBtn.classList.remove("bg-red-600", "text-white");
    weeklyBtn.classList.add("bg-gray-200", "text-gray-700");
  });
});

};

