// src/scripts/client-dashboard/requests.js

window.initRequests = function () {
    console.log("Dealer Requests initialized");

    const form = document.getElementById("dealer-request-form");

    window.nextStep = (step) => {
        // Toggle steps
        document.querySelectorAll("[id^='step-']").forEach(el => el.classList.add("hidden"));
        document.getElementById(`step-${step}`).classList.remove("hidden");

        // Update dots
        document.querySelectorAll(".step-dot").forEach((dot, idx) => {
            if (idx + 1 < step) {
                dot.classList.remove("bg-gray-100", "bg-red-600");
                dot.classList.add("bg-green-500");
                dot.innerHTML = `<i class="fas fa-check text-[8px] text-white"></i>`;
                dot.classList.add("flex", "items-center", "justify-center");
            } else if (idx + 1 === step) {
                dot.classList.remove("bg-gray-100", "bg-green-500");
                dot.classList.add("bg-red-600");
                dot.innerHTML = "";
            } else {
                dot.classList.add("bg-gray-100");
                dot.classList.remove("bg-red-600", "bg-green-500");
                dot.innerHTML = "";
            }
        });

        // Update lines
        if (step > 1) document.getElementById("progress-1").style.width = "100%";
        else document.getElementById("progress-1").style.width = "0%";

        if (step > 2) document.getElementById("progress-2").style.width = "100%";
        else document.getElementById("progress-2").style.width = "0%";
    };

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            window.ToastService.success("Request submitted successfully!");
            window.location.hash = "overview";
        };
    }
};
