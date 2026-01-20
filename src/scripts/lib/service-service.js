/**
 * ServiceService
 * Manages service tickets with localStorage persistence.
 */
class ServiceService {
    constructor() {
        this.STORAGE_KEY = "rci_services_v1";
        this.services = this._loadServices();
    }

    _loadServices() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Mock Data
        return [
            {
                id: 101,
                clientName: "First Bank Plc",
                type: "Maintenance",
                branch: "Lagos",
                engineer: "Chioma Okeke",
                status: "Active",
                startDate: "2024-01-10",
                description: "quarterly maintenance of 50 scanners",
                timeline: [
                    { date: "2024-01-10", text: "Service assigned to Chioma Okeke" }
                ]
            },
            {
                id: 102,
                clientName: "TechSolutions Ltd",
                type: "Installation",
                branch: "Abuja",
                engineer: "Unassigned",
                status: "Pending",
                startDate: "2024-01-18",
                description: "Installation of new MFP series",
                timeline: [
                    { date: "2024-01-18", text: "Service request received" }
                ]
            },
            {
                id: 103,
                clientName: "NNPC Ltd",
                type: "Support",
                branch: "Port Harcourt",
                engineer: "John Dept",
                status: "Completed",
                startDate: "2023-12-05",
                completionDate: "2023-12-07",
                description: "Fixing network connectivity issues on main printer",
                timeline: [
                    { date: "2023-12-05", text: "Service started" },
                    { date: "2023-12-07", text: "Issue resolved. Ticket closed." }
                ]
            }
        ];
    }

    _save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.services));
    }

    getAllServices() {
        return this.services.sort((a, b) => b.id - a.id);
    }

    getStats() {
        const total = this.services.length;
        const active = this.services.filter(s => s.status === 'Active').length;
        const pending = this.services.filter(s => s.status === 'Pending').length;
        const completed = this.services.filter(s => s.status === 'Completed').length;
        return { total, active, pending, completed };
    }

    addService(service) {
        const newService = {
            id: Date.now(),
            status: "Pending", // Default
            timeline: [{ date: new Date().toISOString().split('T')[0], text: "Service Created" }],
            ...service
        };
        this.services.unshift(newService);
        this._save();
        return newService;
    }

    updateService(id, updates) {
        const index = this.services.findIndex(s => s.id == id);
        if (index !== -1) {
            // If status changes, log it
            if (updates.status && updates.status !== this.services[index].status) {
                const log = {
                    date: new Date().toISOString().split('T')[0],
                    text: `Status changed to ${updates.status}`
                };
                const timeline = this.services[index].timeline || [];
                updates.timeline = [log, ...timeline];
            }

            // If engineer changes, log it
            if (updates.engineer && updates.engineer !== this.services[index].engineer) {
                const log = {
                    date: new Date().toISOString().split('T')[0],
                    text: `Reassigned to ${updates.engineer}`
                };
                const timeline = updates.timeline || this.services[index].timeline || [];
                updates.timeline = [log, ...timeline];
            }

            this.services[index] = { ...this.services[index], ...updates };
            this._save();
            return this.services[index];
        }
        return null;
    }
}

window.ServiceService = new ServiceService();
