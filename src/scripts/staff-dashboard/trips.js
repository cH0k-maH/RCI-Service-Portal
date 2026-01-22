// src/scripts/staff-dashboard/trips.js

window.initTrips = function () {
    console.log("Driver Trips initialized");

    const tripsGrid = document.getElementById("trips-grid");
    const modal = document.getElementById("trip-upload-modal");
    const modalContent = document.getElementById("trip-modal-content");

    // Mock Data
    const trips = [
        {
            id: "TRIP-001",
            from: "Lagos Branch",
            to: "Lekki Phase 1",
            purpose: "AC Service Delivery",
            staff: "Emmanuel (Engineer)",
            vehicle: "Toyota Hilux (LND-123)",
            status: "Pending",
            time: "09:00 AM"
        },
        {
            id: "TRIP-002",
            from: "Victoria Island",
            to: "Ikeja Office",
            purpose: "Parts Pickup",
            staff: "Sarah (Sales)",
            vehicle: "Suzuki Carry (IKJ-456)",
            status: "Ongoing",
            time: "01:30 PM"
        }
    ];

    function renderTrips() {
        if (!tripsGrid) return;
        tripsGrid.innerHTML = trips.map(trip => `
            <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">${trip.id}</span>
                    <span class="px-3 py-1 ${trip.status === 'Ongoing' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'} rounded-lg text-[10px] font-black uppercase tracking-widest">${trip.status}</span>
                </div>
                
                <h3 class="text-xl font-black text-gray-800 tracking-tighter mb-1">${trip.purpose}</h3>
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6"><i class="fas fa-clock mr-1"></i> ${trip.time}</p>

                <div class="space-y-3 mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-map-marker-alt"></i></div>
                        <div>
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Route</p>
                            <p class="text-sm font-bold text-gray-700">${trip.from} <i class="fas fa-arrow-right mx-1 text-gray-300"></i> ${trip.to}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-user-friends"></i></div>
                        <div>
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Personnel</p>
                            <p class="text-sm font-bold text-gray-700">${trip.staff}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-truck"></i></div>
                        <div>
                            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Vehicle</p>
                            <p class="text-sm font-bold text-gray-700">${trip.vehicle}</p>
                        </div>
                    </div>
                </div>

                <button onclick="openTripModal('${trip.id}')" class="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-50 hover:bg-red-700 transition">
                    Complete & Upload
                </button>
            </div>
        `).join('');
    }

    window.openTripModal = (id) => {
        document.getElementById("trip-modal-title").textContent = `Complete Trip ${id}`;
        modal.classList.remove("hidden");
        setTimeout(() => {
            modalContent.classList.remove("scale-95", "opacity-0");
        }, 10);
    };

    window.closeTripModal = () => {
        modalContent.classList.add("scale-95", "opacity-0");
        setTimeout(() => {
            modal.classList.add("hidden");
        }, 200);
    };

    renderTrips();
};
