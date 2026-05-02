// src/routes/reports.js
const router = require("express").Router();
const db = require("./db");
const { authenticate, authorizeRoles } = require("./authmiddleware");

// ── GET occupancy summary per hostel ──────────────────────────
router.get(
  "/occupancy",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT h.HostelName, h.Type,
              COALESCE(SUM(r.Capacity), 0) AS TotalSeats,
COALESCE(SUM(r.OccupiedSeats), 0) AS OccupiedSeats,
COALESCE(SUM(r.Capacity - r.OccupiedSeats), 0) AS FreeSeats,
              ROUND(
  CASE 
    WHEN SUM(r.Capacity) = 0 THEN 0
    ELSE SUM(r.OccupiedSeats) / SUM(r.Capacity) * 100
  END, 1
) AS OccupancyPercent
         FROM HOSTEL h
         JOIN BLOCK b ON h.HostelID = b.HostelID
         JOIN ROOM  r ON b.BlockID  = r.BlockID
        GROUP BY h.HostelID, h.HostelName, h.Type
        ORDER BY OccupancyPercent DESC`,
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── GET allocation breakdown by branch & year ─────────────────
router.get(
  "/by-branch",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT s.Branch, s.Year, COUNT(a.AllocID) AS AllocatedCount
         FROM STUDENT s
         LEFT JOIN ALLOCATION a ON s.StudentID = a.StudentID AND a.Status = 'Active'
        GROUP BY s.Branch, s.Year
        ORDER BY s.Branch, s.Year`,
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── GET unallocated students (no active allocation) ───────────
router.get(
  "/unallocated",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT s.*
         FROM STUDENT s
        WHERE NOT EXISTS (
              SELECT 1 FROM ALLOCATION a
               WHERE a.StudentID = s.StudentID AND a.Status = 'Active'
        )
        ORDER BY s.Year DESC, s.Name`,
      );
      res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── GET allocation audit log ──────────────────────────────────
router.get(
  "/audit-log",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT l.*, s.Name AS StudentName
         FROM ALLOC_LOG l
         LEFT JOIN STUDENT s ON l.StudentID = s.StudentID
        ORDER BY l.ActionTime DESC
        LIMIT 100`,
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── GET payment status summary ────────────────────────────────
router.get(
  "/payments",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT p.Status, COUNT(*) AS Count, COALESCE(SUM(p.Amount), 0) AS TotalAmount
         FROM PAYMENT p
        GROUP BY p.Status`,
      );
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

module.exports = router;
