/**
 * UserService
 * Manages user data with localStorage persistence.
 * Supports CRUD operations for User Management.
 */
class UserService {
    constructor() {
        this.API_URL = "http://localhost:5000/api/users";
        this.BRANCH_URL = "http://localhost:5000/api/branches";
    }

    async getBranches() {
        try {
            const response = await fetch(this.BRANCH_URL);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch branches:", error);
            return [];
        }
    }

    async getAllUsers() {
        try {
            const response = await fetch(this.API_URL);
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch users:", error);
            return [];
        }
    }

    async getUserById(id) {
        // Simple search in current list for now, or fetch if needed
        const users = await this.getAllUsers();
        return users.find(u => u.id === Number(id));
    }

    async addUser(user) {
        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            });
            return await response.json();
        } catch (error) {
            console.error("Failed to add user:", error);
            return { success: false };
        }
    }

    async deleteUser(id, type) {
        try {
            const response = await fetch(`${this.API_URL}/${id}?type=${type}`, {
                method: "DELETE"
            });
            return await response.json();
        } catch (error) {
            console.error("Failed to delete user:", error);
            return { success: false };
        }
    }

    async updateUser(id, updates) {
        try {
            const response = await fetch(`${this.API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            return await response.json();
        } catch (error) {
            console.error("Failed to update user:", error);
            return { success: false };
        }
    }

    /**
     * Check if a specific user has a permission.
     * Delegates to global RoleConfig.
     */
    can(user, permission) {
        if (!window.RoleConfig) {
            console.warn("RoleConfig not loaded");
            return false;
        }
        return window.RoleConfig.hasPermission(user, permission);
    }

    /**
     * Get redirect URL for a user
     */
    getRedirectUrl(user) {
        if (!window.RoleConfig) return "./src/pages/login.html";
        return window.RoleConfig.getRedirectUrl(user);
    }

    /**
     * Get initials from a full name
     */
    getInitials(name) {
        if (!name) return "??";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
    }
}

window.UserService = new UserService();
