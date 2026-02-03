const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function runUpdate() {
    try {
        const sqlPath = path.join(__dirname, '..', 'db', 'update_v1.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('🚀 Running database update from backend...');
        await pool.query(sql);
        console.log('✅ Database updated successfully!');
    } catch (err) {
        console.error('❌ Update failed:', err.message);
    } finally {
        await pool.end();
    }
}

runUpdate();
