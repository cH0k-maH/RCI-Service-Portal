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
    console.log(`🔍 Login attempt for: ${email}`);

    try {
        // 1. Check Staff Table
        console.log("Checking staff table...");
        let userResult = await pool.query(
            'SELECT s.*, b.name as branch_name FROM staff s LEFT JOIN branches b ON s.branch_id = b.id WHERE s.email = $1',
            [email]
        );
        let user = userResult.rows[0];
        let type = 'staff';

        // 2. If not in Staff, check Clients Table
        if (!user) {
            console.log("User not found in staff, checking clients table...");
            userResult = await pool.query(
                'SELECT c.*, b.name as branch_name FROM clients c LEFT JOIN branches b ON c.branch_id = b.id WHERE c.email = $1',
                [email]
            );
            user = userResult.rows[0];
            type = 'client';
        }

        if (!user) {
            console.log("User not found in any table.");
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`User found: ${user.name} (${type})`);

        // 3. Verify Password
        console.log("Verifying password...");
        if (!user.password_hash) {
            console.error("Error: user.password_hash is missing in database!");
            return res.status(500).json({ message: 'Database integrity error' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log("Password mismatch.");
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 4. Generate JWT
        console.log("Generating JWT...");
        if (!process.env.JWT_SECRET) {
            console.error("Error: JWT_SECRET is not defined in environment variables!");
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || user.client_type, type: type },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 5. Return success data
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || user.client_type,
            staffType: user.staff_type || user.client_type,
            branch: user.branch_name,
            type: type
        };

        console.log("Login successful! Sending response.");
        res.json({ token, user: userData });

    } catch (err) {
        console.error("❌ Login Error Details:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, type, contactPerson, phone, branchId } = req.body;
    console.log(`📝 Registration attempt for: ${email} (${type})`);

    try {
        // 1. Check if user already exists (Staff or Client)
        const staffCheck = await pool.query('SELECT id FROM staff WHERE email = $1', [email]);
        const clientCheck = await pool.query('SELECT id FROM clients WHERE email = $1', [email]);

        if (staffCheck.rows.length > 0 || clientCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Insert into Clients table
        const result = await pool.query(
            `INSERT INTO clients (name, email, password_hash, client_type, contact_person, phone, branch_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, email`,
            [name, email, passwordHash, type, contactPerson, phone, branchId]
        );

        console.log(`✅ Registration successful for ${email}`);
        res.status(201).json({
            message: 'Registration successful',
            user: result.rows[0]
        });

    } catch (err) {
        console.error("❌ Registration Error:", err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

module.exports = router;
