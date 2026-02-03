require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        console.log('--- Database Check ---');

        const branchRes = await pool.query('SELECT count(*) FROM branches');
        console.log(`Branches: ${branchRes.rows[0].count}`);

        const staffRes = await pool.query('SELECT count(*), email FROM staff GROUP BY email');
        console.log(`Staff count: ${staffRes.rowCount}`);
        if (staffRes.rowCount > 0) {
            console.log('Staff Emails:', staffRes.rows.map(r => r.email).join(', '));
        }

        const clientRes = await pool.query('SELECT count(*) FROM clients');
        console.log(`Clients count: ${clientRes.rows[0].count}`);

        console.log('----------------------');
    } catch (err) {
        console.error('❌ Check error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
