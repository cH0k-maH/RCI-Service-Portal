/**
 * SettingsService
 * Manages system configuration and preferences.
 */
class SettingsService {
    constructor() {
        this.STORAGE_KEY = "rci_settings_v1";
        this.settings = this._loadSettings();
    }

    _loadSettings() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Default Configuration
        return {
            general: {
                companyName: "RCI Service Portal",
                maintenanceMode: false,
                workingDays: "Monday - Friday"
            },
            branches: [
                { id: "lagos", name: "Lagos", manager: "Unassigned", active: true },
                { id: "abuja", name: "Abuja", manager: "Unassigned", active: true },
                { id: "ph", name: "Port Harcourt", manager: "Unassigned", active: true }
            ],
            notifications: {
                emailAlerts: true,
                dashboardAlerts: true,
                dailySummary: false
            },
            security: {
                loginAttempts: 5,
                sessionTimeout: 30 // minutes
            }
        };
    }

    getSettings() {
        return this.settings;
    }

    updateSection(section, data) {
        if (this.settings[section]) {
            this.settings[section] = { ...this.settings[section], ...data };
            this._save();
            return true;
        }
        return false;
    }

    updateBranch(id, updates) {
        const idx = this.settings.branches.findIndex(b => b.id === id);
        if (idx !== -1) {
            this.settings.branches[idx] = { ...this.settings.branches[idx], ...updates };
            this._save();
            return true;
        }
        return false;
    }

    _save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    }

    // DANGER: Resets everything for demo purposes
    resetSystem() {
        localStorage.clear();
        window.location.reload();
    }
}

window.SettingsService = new SettingsService();
