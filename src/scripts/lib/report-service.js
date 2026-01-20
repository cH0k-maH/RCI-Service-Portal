/**
 * ReportService
 * Aggregates data from UserService, ServiceService, and RequestService
 * to provide insights and analytics.
 */
class ReportService {
    constructor() {
        // No persistence needed for reports, as it computes on the fly
    }

    getBranchStats() {
        const services = window.ServiceService.getAllServices();
        const requests = window.RequestService.getAllRequests();

        const branches = ["Lagos", "Abuja", "Port Harcourt"];
        const stats = {};

        branches.forEach(branch => {
            stats[branch] = {
                totalServices: services.filter(s => s.branch === branch).length,
                activeServices: services.filter(s => s.branch === branch && s.status === 'Active').length,
                completedServices: services.filter(s => s.branch === branch && s.status === 'Completed').length,
                pendingRequests: requests.filter(r => r.branch === branch && r.status === 'Pending').length,
                totalRequests: requests.filter(r => r.branch === branch).length
            };
        });
        return stats;
    }

    getOverallKPIs() {
        const services = window.ServiceService.getAllServices();
        const requests = window.RequestService.getAllRequests();

        return {
            activeJobs: services.filter(s => s.status === 'Active').length,
            pendingApprovals: requests.filter(r => r.status === 'Pending').length,
            completedJobsMonth: services.filter(s => s.status === 'Completed').length, // Simplification for demo
            totalClients: window.UserService.getAllUsers().filter(u => u.type === 'customer' || u.type === 'dealer').length
        };
    }

    // Generate a mock activity log by combining dates from all items
    getActivityLog() {
        const services = window.ServiceService.getAllServices();
        const requests = window.RequestService.getAllRequests();
        const users = window.UserService.getAllUsers();

        let activity = [];

        // Service Logs
        services.forEach(s => {
            activity.push({
                date: s.startDate,
                type: 'Service',
                text: `New Service #${s.id} created for ${s.clientName}`,
                branch: s.branch
            });
            if (s.status === 'Completed') {
                // Mock completion date logic or use today
                activity.push({ date: s.startDate, type: 'Service', text: `Service #${s.id} completed`, branch: s.branch });
            }
        });

        // Request Logs
        requests.forEach(r => {
            activity.push({
                date: r.dateSubmitted,
                type: 'Request',
                text: `New ${r.type} #${r.id} from ${r.requestedBy}`,
                branch: r.branch
            });
        });

        // Sort by Date Descending
        return activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

window.ReportService = new ReportService();
