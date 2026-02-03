const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('Failed to parse JSON'));
                    }
                } else {
                    reject(new Error(`Status Code: ${res.statusCode} - ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function verify() {
    console.log("Starting Verification...");

    try {
        console.log("\n1. Verifying Reports KPI...");
        const kpi = await fetch('http://localhost:5000/api/reports/kpi');
        console.log("✅ Reports KPI Success:", kpi);
    } catch (e) {
        console.error("❌ Reports KPI Failed:", e.message);
    }

    try {
        console.log("\n2. Verifying Weekly Roster...");
        const activity = await fetch('http://localhost:5000/api/activities/weekly');
        console.log("✅ Weekly Roster Success:", Object.keys(activity).length > 0 ? "Data found" : "Empty object (valid)");
    } catch (e) {
        console.error("❌ Weekly Roster Failed:", e.message);
    }

    try {
        console.log("\n3. Verifying Users (Sales Rep Field)...");
        const users = await fetch('http://localhost:5000/api/users');
        const client = users.find(u => u.type === 'customer' || u.type === 'dealer');
        if (client && client.hasOwnProperty('sales_rep_id')) {
            console.log("✅ Users/Sales Rep Success: 'sales_rep_id' field present on client.");
        } else if (client) {
            console.error("❌ Users/Sales Rep Failed: 'sales_rep_id' missing from client object.", client);
        } else {
            console.warn("⚠️ No clients found to verify sales_rep_id.");
        }
    } catch (e) {
        console.error("❌ Users Failed:", e.message);
    }
}

verify();
