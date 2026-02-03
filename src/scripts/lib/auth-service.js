/**
 * AuthService
 * Handles user authentication and session management.
 * Currently checks against hardcoded values but is designed to be easily swapped for a real API.
 */
class AuthService {
    constructor() {
        this.userRole = localStorage.getItem("userRole") || null;
    }

    /**
     * Attempt to log the user in.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, message?: string, role?: string}>}
     */
    async login(email, password) {
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Success: data contains { token, user }
                this._setSession(data);
                return { success: true, role: data.user.type };
            } else {
                // Error: data contains { message }
                return { success: false, message: data.message || "Login failed" };
            }
        } catch (error) {
            console.error("AuthService Login Error:", error);
            return { success: false, message: "Server connection error. Please try again later." };
        }
    }

    _setSession(data) {
        const { token, user } = data;
        this.userRole = user.type; // staff, admin, client

        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", user.type);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("staffType", (user.role || user.staffType).toLowerCase());
        localStorage.setItem("branch", user.branch || "N/A");
    }

    /**
     * Log the user out.
     */
    logout() {
        this.userRole = null;
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("staffType");
        localStorage.removeItem("branch");
        window.location.reload();
    }

    /**
     * Check if a user is currently logged in.
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.userRole;
    }

    /**
     * Get the current user role.
     * @returns {string|null}
     */
    getRole() {
        return this.userRole;
    }
}

// Expose a global instance
window.AuthService = new AuthService();
