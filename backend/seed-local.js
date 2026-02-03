const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function seed() {
    try {
        console.log('🌱 Starting database seeding from backend folder...');

        // 1. Get Branch IDs
        const branchRes = await pool.query('SELECT id, name FROM branches');
        const branches = {};
        branchRes.rows.forEach(b => branches[b.name] = b.id);

        const hqId = branches['Headquarters'];
        const lagosId = branches['Lagos Branch'];

        if (!hqId || !lagosId) {
            console.error('❌ Branches not found. Please run init.sql first.');
            return;
        }

        // 2. Hash Passwords
        const adminPw = await bcrypt.hash('admin123', 10);
        const managerPw = await bcrypt.hash('manager123', 10);
        const engPw = await bcrypt.hash('eng123', 10);
        const salesPw = await bcrypt.hash('sales123', 10);
        const secPw = await bcrypt.hash('sec123', 10);
        const drivePw = await bcrypt.hash('drive123', 10);
        const dealerPw = await bcrypt.hash('dealer123', 10);
        const custPw = await bcrypt.hash('cust123', 10);

        // 3. Seed Staff
        const staffData = [
            ['System Admin', 'admin@rci.com', adminPw, 'admin', 'Admin', hqId],
            ['John Branch Manager', 'manager@rci.com', managerPw, 'manager', 'Manager', lagosId],
            ['Chioma Okeke', 'engineer@rci.com', engPw, 'engineer', 'Engineer', lagosId],
            ['Mark Sales', 'sales@rci.com', salesPw, 'sales', 'Sales', lagosId],
            ['Sarah Secretary', 'secretary@rci.com', secPw, 'secretary', 'Secretary', hqId],
            ['Bala Driver', 'driver@rci.com', drivePw, 'driver', 'Driver', lagosId]
        ];

        for (const s of staffData) {
            await pool.query(
                'INSERT INTO staff (name, email, password_hash, role, staff_type, branch_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
                s
            );
        }

        // 4. Seed Clients
        const clientData = [
            ['Partner Dealer Ltd', 'dealer@partner.com', dealerPw, 'dealer', 'John Dealer', '08012345678', hqId, 5000000, 1250000],
            ['Client Corporate Plc', 'customer@client.com', custPw, 'customer', 'Alice Client', '08098765432', lagosId, 0, 0]
        ];

        for (const c of clientData) {
            await pool.query(
                `INSERT INTO clients (name, email, password_hash, client_type, contact_person, phone, branch_id, credit_limit, outstanding_balance) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (email) DO NOTHING`,
                c
            );
        }

        console.log('✅ Seeding completed successfully!');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await pool.end();
    }
}

seed();
