/**
 * UserService
 * Manages user data with localStorage persistence.
 * Supports CRUD operations for User Management.
 */
class UserService {
    constructor() {
        this.STORAGE_KEY = "rci_users_v2";

        // Clear old v1 data if it exists
        if (localStorage.getItem("rci_users_v1")) {
            localStorage.removeItem("rci_users_v1");
        }

        this.users = this._loadUsers();
    }

    _loadUsers() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Rich Mock Data for RBAC Testing
        return [
            // --- ADMIN ---
            {
                id: 1,
                type: "staff",
                name: "System Admin",
                email: "admin@rci.com",
                role: "Admin",
                displayRole: "Global Admin",
                branch: "Headquarters",
                status: "Active",
                notes: "Super User",
                createdDate: "2024-01-01T10:00:00.000Z",
                secondaryInfo: "08000000000"
            },
            // --- LAGOS BRANCH STAFF ---
            {
                id: 2,
                type: "staff",
                name: "Lagos Manager",
                email: "manager.lagos@rci.com",
                role: "Manager",
                displayRole: "Branch Manager",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-01-02T09:00:00.000Z",
                secondaryInfo: "08011111111"
            },
            {
                id: 3,
                type: "staff",
                name: "Sarah Sales",
                email: "sales.lagos@rci.com",
                role: "Sales",
                displayRole: "Sales Executive",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-01-03T09:00:00.000Z",
                secondaryInfo: "08022222222"
            },
            {
                id: 4,
                type: "staff",
                name: "Susan Secretary",
                email: "secretary.lagos@rci.com",
                role: "Secretary",
                displayRole: "Admin Assistant",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-01-04T09:00:00.000Z",
                secondaryInfo: "08033333333"
            },
            {
                id: 5,
                type: "staff",
                name: "Emmanuel Engineer",
                email: "engineer.lagos@rci.com",
                role: "Engineer",
                displayRole: "Senior Engineer",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-01-05T09:00:00.000Z",
                secondaryInfo: "08044444444"
            },
            {
                id: 6,
                type: "staff",
                name: "David Driver",
                email: "driver.lagos@rci.com",
                role: "Driver",
                displayRole: "Logistics Officer",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-01-06T09:00:00.000Z",
                secondaryInfo: "08055555555"
            },
            // --- EXTERNAL ---
            {
                id: 10,
                type: "dealer",
                name: "TechSolutions Ltd",
                contactPerson: "John Doe",
                email: "dealer@tech.com",
                role: "Dealer",
                displayRole: "Sales Partner",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-02-01T10:00:00.000Z",
                secondaryInfo: "John Doe"
            },
            {
                id: 11,
                type: "customer",
                name: "First Bank Plc",
                contactPerson: "Jane Smith",
                email: "client@firstbank.com",
                role: "Customer",
                displayRole: "Corporate Client",
                branch: "Lagos",
                status: "Active",
                createdDate: "2024-02-02T10:00:00.000Z",
                secondaryInfo: "Jane Smith"
            }
        ];
    }

    _save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    }

    getAllUsers() {
        return this.users.sort((a, b) => b.id - a.id); // Newest first
    }

    getUserById(id) {
        return this.users.find(u => u.id === Number(id));
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    addUser(user) {
        const newUser = {
            id: Date.now(),
            createdDate: new Date().toISOString(), // Auto set created date
            status: "Active", // Default status
            ...user
        };
        this.users.push(newUser);
        this._save();
        return newUser;
    }

    updateUser(id, updates) {
        const index = this.users.findIndex(u => u.id === Number(id));
        if (index !== -1) {
            // Keep createdDate, overwrite others
            this.users[index] = { ...this.users[index], ...updates };
            this._save();
            return this.users[index];
        }
        return null;
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== Number(id));
        this._save();
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
}

window.UserService = new UserService();
