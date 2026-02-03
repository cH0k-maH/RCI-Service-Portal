/**
 * NotificationService
 * Manages fetching and reading notifications.
 */
class NotificationService {
    constructor() {
        this.API_URL = "http://localhost:5000/api/admin-tools/notifications";
    }

    async getNotifications(userId, userType) {
        try {
            const res = await fetch(`${this.API_URL}/${userId}?type=${userType}`);
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            return [];
        }
    }

    async markAsRead(id) {
        try {
            await fetch(`${this.API_URL}/${id}/read`, { method: "PATCH" });
            return true;
        } catch (err) {
            console.error("Failed to mark read:", err);
            return false;
        }
    }
}

window.NotificationService = new NotificationService();
