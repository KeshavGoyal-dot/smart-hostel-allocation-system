// src/app.js
require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./auth");
const studentRoutes = require("./students");
const hostelRoutes = require("./hostels");
const allocationRoutes = require("./allocations");
const waitlistRoutes = require("./waitlist");
const reportRoutes = require("./reports");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/reports", reportRoutes);

// ── Health check ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "🏨 Smart Hostel Allocation System API",
    version: "1.0.0",
    project: "UCS310 – DBMS | Thapar Institute",
    endpoints: {
      auth: "/api/auth",
      students: "/api/students",
      hostels: "/api/hostels",
      allocations: "/api/allocations",
      waitlist: "/api/waitlist",
      reports: "/api/reports",
    },
  });
});

// ── Global error handler ────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});
