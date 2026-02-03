const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// GET /api/reports/kpi - Overall KPIs
router.get('/kpi', async (req, res) => {
    try {
        // Run queries in parallel
        const activeJobsQ = pool.query("SELECT COUNT(*) FROM service_jobs WHERE status = 'Active'");
        const pendingReqQ = pool.query("SELECT COUNT(*) FROM service_requests WHERE status = 'Pending'");
        const completedJobsQ = pool.query("SELECT COUNT(*) FROM service_jobs WHERE status = 'Completed'");
        const totalClientsQ = pool.query("SELECT COUNT(*) FROM clients");

        const [activeJobs, pendingReq, completedJobs, totalClients] = await Promise.all([
            activeJobsQ, pendingReqQ, completedJobsQ, totalClientsQ
        ]);

        res.json({
            activeJobs: parseInt(activeJobs.rows[0].count),
            pendingApprovals: parseInt(pendingReq.rows[0].count),
            completedJobsMonth: parseInt(completedJobs.rows[0].count),
            totalClients: parseInt(totalClients.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch KPIs' });
    }
});

// GET /api/reports/branches - Stats per branch
router.get('/branches', async (req, res) => {
    try {
        // Get all branches
        const branches = await pool.query("SELECT id, name FROM branches");
        const stats = {};

        for (const branch of branches.rows) {
            const bId = branch.id;
            const bName = branch.name;

            const totalServices = await pool.query("SELECT COUNT(*) FROM service_jobs sj JOIN service_requests sr ON sj.request_id = sr.id WHERE sr.branch_id = $1", [bId]);
            const activeServices = await pool.query("SELECT COUNT(*) FROM service_jobs sj JOIN service_requests sr ON sj.request_id = sr.id WHERE sr.branch_id = $1 AND sj.status = 'Active'", [bId]);
            const pendingRequests = await pool.query("SELECT COUNT(*) FROM service_requests WHERE branch_id = $1 AND status = 'Pending'", [bId]);
            const completedServices = await pool.query("SELECT COUNT(*) FROM service_jobs sj JOIN service_requests sr ON sj.request_id = sr.id WHERE sr.branch_id = $1 AND sj.status = 'Completed'", [bId]);
            const totalRequests = await pool.query("SELECT COUNT(*) FROM service_requests WHERE branch_id = $1", [bId]);

            stats[bName] = {
                totalServices: parseInt(totalServices.rows[0].count),
                activeServices: parseInt(activeServices.rows[0].count),
                completedServices: parseInt(completedServices.rows[0].count),
                pendingRequests: parseInt(pendingRequests.rows[0].count),
                totalRequests: parseInt(totalRequests.rows[0].count)
            };
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch branch stats' });
    }
});

// GET /api/reports/activity-log - Recent activity
router.get('/activity-log', async (req, res) => {
    try {
        const query = `
            SELECT 
                jl.created_at as date,
                'Service' as type,
                jl.log_text as text,
                b.name as branch
            FROM job_logs jl
            JOIN service_jobs sj ON jl.job_id = sj.id
            JOIN service_requests sr ON sj.request_id = sr.id
            LEFT JOIN branches b ON sr.branch_id = b.id
            ORDER BY jl.created_at DESC
            LIMIT 50
        `;
        const result = await pool.query(query);

        // Simplified mapping
        const logs = result.rows.map(row => ({
            date: row.date,
            type: row.type,
            text: row.text,
            branch: row.branch,
        }));

        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch activity log' });
    }
});

module.exports = router;
