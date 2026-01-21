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
                // 1. HARDCODED MOCKS (For Quick Testing)
                if (email === "admin@rci.com" && password === "admin123") {
                    this._setSession("admin", "Admin User", "admin", "Lagos");
                    resolve({ success: true, role: "admin" });
                    return;
                }
                if (email === "manager@rci.com" && password === "manager123") {
                    this._setSession("staff", "Chioma Manager", "Manager", "Lagos");
                    resolve({ success: true, role: "staff" });
                    return;
                }
                if (email === "staff@rci.com" && password === "staff123") {
                    this._setSession("staff", "Emeka Engineer", "Engineer", "Lagos");
                    resolve({ success: true, role: "staff" });
                    return;
                }
                if (email === "sales@rci.com" && password === "sales123") {
                    this._setSession("staff", "Sarah Sales", "Sales", "Lagos");
                    resolve({ success: true, role: "staff" });
                    return;
                }
                if (email === "secretary@rci.com" && password === "sec123") {
                    this._setSession("staff", "Bimbo Secretary", "Secretary", "Lagos");
                    resolve({ success: true, role: "staff" });
                    return;
                }
                if (email === "driver@rci.com" && password === "drive123") {
                    this._setSession("staff", "Dan Driver", "Logistics", "Lagos");
                    resolve({ success: true, role: "staff" });
                    return;
                }

                // 2. CHECK DYNAMIC USERS (From Admin Creation)
                // Note: In real app, this is API. Here we check localStorage "database".
                // We assume a default password hierarchy or check against something stored.
                // For prototype: If user exists in UserService and password is 'rci123', allow login.

                const allUsers = window.UserService ? window.UserService.getAllUsers() : [];
                const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (foundUser) {
                    // Simple password check for prototype
                    if (password === "rci123") {
                        const systemRole = foundUser.role === "Admin" ? "admin" :
                            (foundUser.type === "staff" ? "staff" : "customer");

                        this._setSession(
                            systemRole,
                            foundUser.name,
                            foundUser.role, // e.g. "Engineer", "Sales"
                            foundUser.branch || "Lagos"
                        );
                        resolve({ success: true, role: systemRole });
                        return;
                    }
                }

                resolve({ success: false, message: "Invalid email or password." });
            }, 800);
        });
    }

    _setSession(role, name, type, branch) {
        this.userRole = role;
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", name);
        localStorage.setItem("staffType", type.toLowerCase()); // engineer, sales, etc.
        localStorage.setItem("branch", branch);
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
