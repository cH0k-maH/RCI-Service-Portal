const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runUpdate() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'db', 'update_v2.sql'), 'utf8');
        console.log('🚀 Running database update...');
        await pool.query(sql);
        console.log('✅ Database updated successfully!');
    } catch (err) {
        console.error('❌ Update failed:', err.message);
    } finally {
        await pool.end();
    }
}

runUpdate();
