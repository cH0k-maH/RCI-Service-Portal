/**
 * RequestService
 * Manages incoming requests (Service, Quote, Support) with localStorage persistence.
 */
class RequestService {
    constructor() {
        this.STORAGE_KEY = "rci_requests_v1";
        this.requests = this._loadRequests();
    }

    _loadRequests() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Mock Data
        return [
            {
                id: 501,
                type: "Service Request",
                requestedBy: "First Bank Plc",
                clientName: "First Bank Plc",
                branch: "Lagos",
                dateSubmitted: "2024-01-19",
                priority: "High",
                status: "Pending",
                description: "Urgent repair needed for ATM lobby AC units",
                notes: "",
                rejectionReason: ""
            },
            {
                id: 502,
                type: "Quotation Request",
                requestedBy: "Sales Team (John)",
                clientName: "New Corp Ltd",
                branch: "Abuja",
                dateSubmitted: "2024-01-18",
                priority: "Medium",
                status: "Pending",
                description: "Quote for 10 new Dell Workstations",
                notes: "",
                rejectionReason: ""
            },
            {
                id: 503,
                type: "Support Request",
                requestedBy: "TechSolutions Ltd",
                clientName: "TechSolutions Ltd",
                branch: "Port Harcourt",
                dateSubmitted: "2024-01-15",
                priority: "Low",
                status: "Approved",
                description: "Access issue with dealer portal",
                notes: "Reset credentials sent.",
                rejectionReason: ""
            },
            {
                id: 504,
                type: "Service Request",
                requestedBy: "Unknown Dealer",
                clientName: "Unknown",
                branch: "Lagos",
                dateSubmitted: "2024-01-10",
                priority: "Low",
                status: "Rejected",
                description: "Requesting unauthorized software key",
                notes: "",
                rejectionReason: "Policy violation. We do not support this software."
            }
        ];
    }

    _save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.requests));
    }

    getAllRequests() {
        return this.requests.sort((a, b) => b.id - a.id);
    }

    getStats() {
        const total = this.requests.length;
        const pending = this.requests.filter(r => r.status === 'Pending').length;
        const approved = this.requests.filter(r => r.status === 'Approved').length;
        const rejected = this.requests.filter(r => r.status === 'Rejected').length;
        return { total, pending, approved, rejected };
    }

    addRequest(request) {
        const newRequest = {
            id: Date.now(),
            status: "Pending",
            dateSubmitted: new Date().toISOString().split('T')[0],
            ...request
        };
        this.requests.unshift(newRequest);
        this._save();
        return newRequest;
    }

    updateRequest(id, updates) {
        const index = this.requests.findIndex(r => r.id == id);
        if (index !== -1) {
            this.requests[index] = { ...this.requests[index], ...updates };
            this._save();
            return this.requests[index];
        }
        return null;
    }
}

window.RequestService = new RequestService();
