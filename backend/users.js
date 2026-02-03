const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// GET /api/users - Get all staff and clients
router.get('/', async (req, res) => {
    try {
        const staffRes = await pool.query(`
            SELECT s.id, s.name, s.email, s.role, s.staff_type, b.name as branch, s.status, 'staff' as type 
            FROM staff s LEFT JOIN branches b ON s.branch_id = b.id
        `);

        const clientRes = await pool.query(`
            SELECT c.id, c.name, c.email, c.client_type as role, c.client_type as staff_type, 
                   b.name as branch, c.status, c.client_type as type,
                   c.sales_rep_id, s.name as sales_rep_name
            FROM clients c 
            LEFT JOIN branches b ON c.branch_id = b.id
            LEFT JOIN staff s ON c.sales_rep_id = s.id
        `);

        const allUsers = [...staffRes.rows, ...clientRes.rows];
        res.json(allUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// POST /api/users - Add a new user (Admin functionality)
router.post('/', async (req, res) => {
    let { name, email, password, role, type, branchId, branch, staffType, contactPerson, phone } = req.body;

    try {
        // Resolve branchId if name was provided instead
        if (!branchId && branch) {
            const bRes = await pool.query('SELECT id FROM branches WHERE name ILIKE $1', [branch]);
            if (bRes.rows.length > 0) branchId = bRes.rows[0].id;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password || 'rci123', salt);

        if (type === 'staff') {
            await pool.query(
                'INSERT INTO staff (name, email, password_hash, role, staff_type, branch_id) VALUES ($1, $2, $3, $4, $5, $6)',
                [name, email, passwordHash, role, staffType || role, branchId]
            );
        } else {
            await pool.query(
                'INSERT INTO clients (name, email, password_hash, client_type, contact_person, phone, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [name, email, passwordHash, type, contactPerson || name, phone, branchId]
            );
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, type, branchId, staffType, contactPerson, phone, status, notes, sales_rep_id } = req.body;

    try {
        let passwordHash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(password, salt);
        }

        // Resolve branchId if name was provided instead
        if (!branchId && branch) {
            const bRes = await pool.query('SELECT id FROM branches WHERE name ILIKE $1', [branch]);
            if (bRes.rows.length > 0) branchId = bRes.rows[0].id;
        }

        if (type === 'staff') {
            await pool.query(
                `UPDATE staff SET 
                    name = COALESCE($1, name), 
                    email = COALESCE($2, email), 
                    password_hash = COALESCE($3, password_hash),
                    role = COALESCE($4, role),
                    staff_type = COALESCE($5, staff_type),
                    branch_id = COALESCE($6, branch_id),
                    status = COALESCE($7, status)
                 WHERE id = $8`,
                [name, email, passwordHash, role, staffType || role, branchId, status, id]
            );
        } else {
            await pool.query(
                `UPDATE clients SET 
                    name = COALESCE($1, name), 
                    email = COALESCE($2, email), 
                    password_hash = COALESCE($3, password_hash),
                    client_type = COALESCE($4, client_type),
                    contact_person = COALESCE($5, contact_person),
                    phone = COALESCE($6, phone),
                    branch_id = COALESCE($7, branch_id),
                    status = COALESCE($8, status),
                    sales_rep_id = COALESCE($9, sales_rep_id)
                 WHERE id = $10`,
                [name, email, passwordHash, type, contactPerson || name, phone, branchId, status, sales_rep_id, id]
            );
        }

        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // 'staff', 'dealer', or 'customer'

    try {
        if (type === 'staff') {
            await pool.query('DELETE FROM staff WHERE id = $1', [id]);
        } else {
            await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

module.exports = router;
