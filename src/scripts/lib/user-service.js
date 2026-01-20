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
        // Rich Mock Data
        return [
            {
                id: 1,
                type: "staff",
                name: "Admin User",
                email: "admin@rci.com",
                role: "Admin",
                displayRole: "Admin",
                branch: "Lagos",
                status: "Active",
                notes: "System Administrator",
                createdDate: "2024-01-01T10:00:00.000Z",
                secondaryInfo: "08011122233"
            },
            {
                id: 2,
                type: "staff",
                name: "Chioma Okeke",
                email: "chioma@rci.com",
                role: "Engineer",
                displayRole: "Engineer",
                branch: "Abuja",
                status: "Active",
                createdDate: "2024-01-15T09:30:00.000Z",
                secondaryInfo: "07080090011"
            },
            {
                id: 3,
                type: "dealer",
                name: "TechSolutions Ltd",
                contactPerson: "John Doe",
                email: "john@techsolutions.com",
                role: "Dealer",
                displayRole: "Sales Partner",
                branch: "Lagos",
                status: "Pending",
                createdDate: new Date().toISOString(),
                secondaryInfo: "John Doe"
            },
            {
                id: 4,
                type: "customer",
                name: "First Bank Plc",
                contactPerson: "Jane Smith",
                email: "procurement@firstbank.com",
                role: "Customer",
                displayRole: "Corporate",
                branch: "Port Harcourt",
                status: "Active",
                createdDate: new Date().toISOString(),
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

    addUser(user) {
        const newUser = {
            id: Date.now(),
            createdDate: new Date().toISOString(), // Auto set created date
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
            // Update lastModified if you had that field
            this._save();
            return this.users[index];
        }
        return null;
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== Number(id));
        this._save();
    }
}

window.UserService = new UserService();
