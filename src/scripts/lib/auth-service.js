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
        // Simmons a network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // TODO: Replace this with a real API call
                // fetch('/api/login', { method: 'POST', ... })

                if (email === "admin@rci.com" && password === "admin123") {
                    this.userRole = "admin";
                    localStorage.setItem("userRole", "admin");
                    resolve({ success: true, role: "admin" });
                } else if (email === "user@rci.com" && password === "user123") {
                    this.userRole = "customer";
                    localStorage.setItem("userRole", "customer");
                    resolve({ success: true, role: "customer" });
                } else {
                    resolve({ success: false, message: "Invalid email or password." });
                }
            }, 800);
        });
    }

    /**
     * Log the user out.
     */
    logout() {
        this.userRole = null;
        localStorage.removeItem("userRole");
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
