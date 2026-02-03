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

// --- HELPER: Create Notification ---
async function createNotification(userId, userType, title, message, type, link) {
    try {
        await pool.query(
            'INSERT INTO notifications (user_id, user_type, title, message, type, link) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, userType, title, message, type, link]
        );
    } catch (err) {
        console.error('Failed to create notification:', err.message);
    }
}

// ===============================
// 1. TASKS API
// ===============================

// GET /api/tasks/:staffId - Get all tasks for a specific staff member
router.get('/tasks/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;
        const result = await pool.query(
            'SELECT t.*, s.name as assigned_by_name FROM staff_tasks t LEFT JOIN staff s ON t.assigned_by = s.id WHERE t.staff_id = $1 ORDER BY t.created_at DESC',
            [staffId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks - Assign a new task
router.post('/tasks', async (req, res) => {
    const { staffId, title, description, priority, dueDate, assignedBy } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO staff_tasks (staff_id, title, description, priority, due_date, assigned_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [staffId, title, description, priority, dueDate, assignedBy]
        );

        // Notify Staff
        await createNotification(staffId, 'staff', 'New Task Assigned', `You have been assigned a new task: ${title}`, 'task', '#tasks');

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to assign task' });
    }
});

// ===============================
// 2. QUERIES API
// ===============================

// GET /api/queries/:staffId
router.get('/queries/:staffId', async (req, res) => {
    try {
        const { staffId } = req.params;
        const result = await pool.query(
            'SELECT q.*, s.name as issued_by_name FROM staff_queries q LEFT JOIN staff s ON q.issued_by = s.id WHERE q.staff_id = $1 ORDER BY q.created_at DESC',
            [staffId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch queries' });
    }
});

// POST /api/queries
router.post('/queries', async (req, res) => {
    const { staffId, title, reason, issuedBy } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO staff_queries (staff_id, title, reason, issued_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [staffId, title, reason, issuedBy]
        );

        // Notify Staff
        await createNotification(staffId, 'staff', 'New Query Issued', `An official query has been issued: ${title}`, 'query', '#requests');

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to issue query' });
    }
});

// ===============================
// 3. COMPLAINTS API
// ===============================

// GET /api/complaints/:clientId
router.get('/complaints/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const result = await pool.query(
            'SELECT * FROM customer_complaints WHERE client_id = $1 ORDER BY created_at DESC',
            [clientId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch complaints' });
    }
});

// POST /api/complaints
router.post('/complaints', async (req, res) => {
    const { clientId, subject, description, loggedBy } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO customer_complaints (client_id, subject, description, logged_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [clientId, subject, description, loggedBy]
        );

        // No notification for client yet, usually internal
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to log complaint' });
    }
});

// ===============================
// 4. NOTIFICATIONS API
// ===============================

// GET /api/notifications/:userId?type=staff|client
router.get('/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    const { type } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 AND user_type = $2 ORDER BY created_at DESC LIMIT 20',
            [userId, type]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});

module.exports = router;
