/**
 * NotificationUI
 * Logic for handling the notification bell dropdown and list.
 */
window.NotificationUI = {
    init: function (userId, userType) {
        console.log("Notification UI initialized for", userType, userId);
        this.userId = userId;
        this.userType = userType;
        this.bell = document.getElementById("notification-bell");
        this.badge = document.getElementById("notification-badge");
        this.dropdown = document.getElementById("notification-dropdown");
        this.list = document.getElementById("notification-list");
        this.clearBtn = document.getElementById("mark-all-read");

        if (!this.bell || !this.dropdown) return;

        // Toggle Dropdown
        this.bell.onclick = (e) => {
            e.stopPropagation();
            this.dropdown.classList.toggle("hidden");
            if (!this.dropdown.classList.contains("hidden")) {
                this.loadNotifications();
            }
        };

        // Close on click outside
        document.addEventListener("click", () => {
            if (this.dropdown) this.dropdown.classList.add("hidden");
        });

        this.dropdown.onclick = (e) => e.stopPropagation();

        // Initial check for badge
        this.updateBadge();

        // Polling (optional for demo, every 60s)
        setInterval(() => this.updateBadge(), 60000);
    },

    updateBadge: async function () {
        if (!window.NotificationService) return;
        const notifications = await window.NotificationService.getNotifications(this.userId, this.userType);
        const unread = notifications.filter(n => !n.is_read).length;

        if (unread > 0) {
            this.badge.textContent = unread > 9 ? "9+" : unread;
            this.badge.classList.remove("hidden");
        } else {
            this.badge.classList.add("hidden");
        }
    },

    loadNotifications: async function () {
        if (!window.NotificationService || !this.list) return;
        this.list.innerHTML = `<div class="p-6 text-center text-gray-400"><i class="fas fa-circle-notch fa-spin"></i></div>`;

        const notifications = await window.NotificationService.getNotifications(this.userId, this.userType);

        if (notifications.length === 0) {
            this.list.innerHTML = `<div class="p-8 text-center text-gray-400 text-sm italic">No notifications yet.</div>`;
            return;
        }

        this.list.innerHTML = "";
        notifications.forEach(n => {
            const item = document.createElement("div");
            item.className = `p-4 border-b hover:bg-gray-50 cursor-pointer transition ${n.is_read ? 'opacity-60' : 'bg-red-50/30'}`;

            let icon = "fa-info-circle text-blue-500";
            if (n.type === 'task') icon = "fa-tasks text-purple-500";
            if (n.type === 'query') icon = "fa-exclamation-triangle text-red-500";
            if (n.type === 'complaint') icon = "fa-comment-medical text-orange-500";

            item.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="mt-1"><i class="fas ${icon}"></i></div>
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-800">${n.title}</p>
                        <p class="text-xs text-gray-600 mt-0.5">${n.message}</p>
                        <p class="text-[10px] text-gray-400 mt-1">${new Date(n.created_at).toLocaleTimeString()}</p>
                    </div>
                </div>
            `;

            item.onclick = async () => {
                await window.NotificationService.markAsRead(n.id);
                if (n.link) window.location.hash = n.link;
                this.updateBadge();
                this.dropdown.classList.add("hidden");
            };

            this.list.appendChild(item);
        });
    }
};
