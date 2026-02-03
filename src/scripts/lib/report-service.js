/**
 * ReportService
 * Aggregates data from UserService, ServiceService, and RequestService
 * to provide insights and analytics.
 */
class ReportService {
    constructor() {
        // No persistence needed for reports, as it computes on the fly
    }

    async getBranchStats() {
        try {
            const res = await fetch('http://localhost:5000/api/reports/branches');
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch branch stats", e);
            return {};
        }
    }

    async getOverallKPIs() {
        try {
            const res = await fetch('http://localhost:5000/api/reports/kpi');
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch KPIs", e);
            return { activeJobs: 0, pendingApprovals: 0, completedJobsMonth: 0, totalClients: 0 };
        }
    }

    // Generate a mock activity log by combining dates from all items
    async getActivityLog() {
        try {
            const res = await fetch('http://localhost:5000/api/reports/activity-log');
            return await res.json();
        } catch (e) {
            console.error("Failed to fetch activity log", e);
            return [];
        }
    }
}

window.ReportService = new ReportService();
