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

// GET /api/activities/weekly - Get full weekly roster
router.get('/weekly', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM weekly_roster ORDER BY id ASC');
        // Transform array to object keyed by Day for frontend convenience
        const roster = {};
        result.rows.forEach(row => {
            roster[row.day_of_week] = { axis: row.axis, staff: row.staff_text };
        });
        res.json(roster);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch weekly roster' });
    }
});

// PUT /api/activities/weekly - Update a specific day
router.put('/weekly', async (req, res) => {
    const { day, axis, staff } = req.body;
    try {
        await pool.query(
            `INSERT INTO weekly_roster (day_of_week, axis, staff_text) 
             VALUES ($1, $2, $3)
             ON CONFLICT (day_of_week) DO UPDATE SET 
             axis = EXCLUDED.axis, 
             staff_text = EXCLUDED.staff_text,
             updated_at = CURRENT_TIMESTAMP`,
            [day, axis, staff]
        );
        res.json({ message: 'Roster updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update roster' });
    }
});

module.exports = router;
