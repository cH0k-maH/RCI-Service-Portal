/**
 * AdminToolService
 * Handles API calls for Tasks, Queries, and Complaints.
 */
class AdminToolService {
    constructor() {
        this.API_URL = "http://localhost:5000/api/admin-tools";
    }

    // --- Tasks ---
    async getStaffTasks(staffId) {
        try {
            const res = await fetch(`${this.API_URL}/tasks/${staffId}`);
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
            return [];
        }
    }

    async assignTask(taskData) {
        try {
            const res = await fetch(`${this.API_URL}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData)
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to assign task:", err);
            return { error: true };
        }
    }

    // --- Queries ---
    async getStaffQueries(staffId) {
        try {
            const res = await fetch(`${this.API_URL}/queries/${staffId}`);
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch queries:", err);
            return [];
        }
    }

    async issueQuery(queryData) {
        try {
            const res = await fetch(`${this.API_URL}/queries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(queryData)
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to issue query:", err);
            return { error: true };
        }
    }

    // --- Complaints ---
    async getClientComplaints(clientId) {
        try {
            const res = await fetch(`${this.API_URL}/complaints/${clientId}`);
            return await res.json();
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
            return [];
        }
    }

    async logComplaint(complaintData) {
        try {
            const res = await fetch(`${this.API_URL}/complaints`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(complaintData)
            });
            return await res.json();
        } catch (err) {
            console.error("Failed to log complaint:", err);
            return { error: true };
        }
    }
}

window.AdminToolService = new AdminToolService();
