const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check Staff Table
        let userResult = await pool.query(
            'SELECT s.*, b.name as branch_name FROM staff s LEFT JOIN branches b ON s.branch_id = b.id WHERE s.email = $1',
            [email]
        );
        let user = userResult.rows[0];
        let type = 'staff';

        // 2. If not in Staff, check Clients Table
        if (!user) {
            userResult = await pool.query(
                'SELECT c.*, b.name as branch_name FROM clients c LEFT JOIN branches b ON c.branch_id = b.id WHERE c.email = $1',
                [email]
            );
            user = userResult.rows[0];
            type = 'client';
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || user.client_type, type: type },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Return success data (stripped of password)
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || user.client_type,
            staffType: user.staff_type || user.client_type,
            branch: user.branch_name,
            type: type
        };

        res.json({ token, user: userData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
