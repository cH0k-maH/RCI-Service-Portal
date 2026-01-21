/**
 * Role Configuration
 * Defines roles, permissions, and helper methods for RBAC.
 */

// Permission Constants
const PERMISSIONS = {
    // User Management
    MANAGE_USERS: "manage_users", // Create/Edit/Delete users
    VIEW_ALL_USERS: "view_all_users",
    VIEW_ASSIGNED_USERS: "view_assigned_users", // Sales viewing their customers
    ASSIGN_CUSTOMERS: "assign_customers",

    // Service/Job Management
    MANAGE_ALL_JOBS: "manage_all_jobs",
    VIEW_ALL_JOBS: "view_all_jobs",
    VIEW_ASSIGNED_JOBS: "view_assigned_jobs",
    ASSIGN_JOBS: "assign_jobs",
    UPDATE_JOB_STATUS: "update_job_status",
    APPROVE_JOB_SHEETS: "approve_job_sheets",

    // Reporting & Activities
    VIEW_ALL_REPORTS: "view_all_reports",
    VIEW_BRANCH_REPORTS: "view_branch_reports",
    Note: "view_own_reports is implicit for all",
    EDIT_WEEKLY_ACTIVITIES: "edit_weekly_activities",
    APPROVE_WEEKLY_ACTIVITY: "approve_weekly_activity",
    UPLOAD_REPORTS: "upload_reports",

    // Financials
    VIEW_FINANCIALS: "view_financials",
    MANAGE_FINANCIALS: "manage_financials",

    // System
    GLOBAL_SETTINGS: "global_settings",
    ACCESS_ALL_BRANCHES: "access_all_branches",
};

// Role Definitions
const RULES = {
    ADMIN: {
        label: "Global Admin",
        permissions: Object.values(PERMISSIONS), // All permissions
        redirectUrl: "./src/pages/admin-dashboard/dashboard.html"
    },
    MANAGER: {
        label: "Branch Manager",
        permissions: [
            PERMISSIONS.VIEW_BRANCH_REPORTS,
            PERMISSIONS.ASSIGN_CUSTOMERS,
            PERMISSIONS.APPROVE_WEEKLY_ACTIVITY,
            PERMISSIONS.APPROVE_JOB_SHEETS,
            PERMISSIONS.VIEW_ALL_USERS, // Within branch
            PERMISSIONS.VIEW_ALL_JOBS,  // Within branch
            PERMISSIONS.EDIT_WEEKLY_ACTIVITIES, // For the branch
            // Explicitly add these for safety if strings differ
            "view_branch_users",
            "view_assigned_users",
            "assign_services",
            "view_assigned_jobs"
        ],
        redirectUrl: "./src/pages/admin-dashboard/dashboard.html"
    },
    SALES: {
        label: "Sales Staff",
        permissions: [
            PERMISSIONS.VIEW_ASSIGNED_USERS,
            PERMISSIONS.UPLOAD_REPORTS,
            PERMISSIONS.VIEW_ASSIGNED_JOBS // To track their client's jobs
        ],
        redirectUrl: "./src/pages/staff-dashboard/staff-dashboard.html"
    },
    SECRETARY: {
        label: "Secretary / Admin Assist",
        permissions: [
            PERMISSIONS.EDIT_WEEKLY_ACTIVITIES,
            PERMISSIONS.UPLOAD_REPORTS,
            PERMISSIONS.VIEW_ALL_JOBS,
            PERMISSIONS.VIEW_ALL_USERS
        ],
        redirectUrl: "./src/pages/staff-dashboard/staff-dashboard.html" // Or admin dashboard with limited view?
        // User requested Secretary view all branch schedules, implying a robust dashboard.
        // Let's stick to Dashboard.html generally but hide things, or Staff dashboard if it's separate.
        // Re-reading user request: "Secretary = System backbone". Likely needs access to Admin Dashboard UI but restricted.
        // Let's route to Admin Dashboard for now and hide modules.
    },
    ENGINEER: {
        label: "Engineer",
        permissions: [
            PERMISSIONS.VIEW_ASSIGNED_JOBS,
            PERMISSIONS.UPDATE_JOB_STATUS,
            PERMISSIONS.UPLOAD_REPORTS
        ],
        redirectUrl: "./src/pages/staff-dashboard/staff-dashboard.html"
    },
    DRIVER: {
        label: "Driver / Logistics",
        permissions: [
            PERMISSIONS.VIEW_ASSIGNED_JOBS, // Logistics tasks
            PERMISSIONS.UPLOAD_REPORTS
        ],
        redirectUrl: "./src/pages/staff-dashboard/staff-dashboard.html"
    }
    // Finance role pending logic
};

// Special logic for Secretary redirect - overriding to Admin Dashboard for now as they are "Admin Assistant"
RULES.SECRETARY.redirectUrl = "./src/pages/admin-dashboard/dashboard.html";


class RoleConfig {
    constructor() {
        this.PERMISSIONS = PERMISSIONS;
        this.ROLES = RULES;
    }

    /**
     * Check if a user has a specific permission
     * @param {Object} user - The user object (must have .role)
     * @param {String} permission - The permission string to check
     * @returns {Boolean}
     */
    hasPermission(user, permission) {
        if (!user || !user.role) return false;

        // Map user.role string (e.g. "Engineer") to key (e.g. "ENGINEER")
        // We need to normalize roles. UserService Mock data has "Admin", "Engineer", "Dealer", "Customer".
        // Let's normalize to uppercase for lookup.

        let roleKey = user.role.toUpperCase();

        // Handle variations
        if (roleKey === "ADMINISTRATOR") roleKey = "ADMIN";

        const roleDef = this.ROLES[roleKey];
        if (!roleDef) return false;

        return roleDef.permissions.includes(permission);
    }

    getRedirectUrl(user) {
        if (!user || !user.role) return "./src/pages/login.html";
        let roleKey = user.role.toUpperCase();
        if (roleKey === "ADMINISTRATOR") roleKey = "ADMIN";

        // Default for Customer/Dealer if not in RULES
        if (user.type === 'customer' || user.type === 'dealer') {
            return "./src/pages/portal/portal.html"; // Assume customer portal
        }

        return this.ROLES[roleKey]?.redirectUrl || "./src/pages/login.html";
    }
}

window.RoleConfig = new RoleConfig();
