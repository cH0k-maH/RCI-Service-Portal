require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test DB connection
pool.connect()
    .then(() => console.log("✅ PostgreSQL connected successfully"))
    .catch(err => console.error("❌ DB connection error:", err));

// Routes
app.use("/api/auth", require("./auth"));
app.use("/api/users", require("./users"));
app.use("/api/branches", require("./branches"));

const adminRouter = require('./admin-tools');
app.use('/api/admin-tools', adminRouter);

const activitiesRouter = require('./activities');
app.use('/api/activities', activitiesRouter);

const reportsRouter = require('./reports');
app.use('/api/reports', reportsRouter);

// Test route
app.get("/", (req, res) => {
    res.json({ message: "RCI Portal server is running 🚀" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
