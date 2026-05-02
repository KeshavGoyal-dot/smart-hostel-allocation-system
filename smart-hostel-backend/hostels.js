// src/routes/hostels.js
const router = require("express").Router();
const db = require("../config/db");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// ── GET all hostels with block & room summary ──────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT h.*,
              COUNT(DISTINCT b.BlockID)                        AS TotalBlocksCount,
              COUNT(r.RoomID)                                  AS TotalRooms,
              SUM(r.Capacity)                                  AS TotalCapacity,
              SUM(r.OccupiedSeats)                             AS TotalOccupied,
              SUM(r.Capacity) - SUM(r.OccupiedSeats)           AS AvailableSeats
         FROM HOSTEL h
         LEFT JOIN BLOCK b ON h.HostelID = b.HostelID
         LEFT JOIN ROOM  r ON b.BlockID  = r.BlockID
        GROUP BY h.HostelID`,
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── GET rooms in a hostel (with availability) ──────────────────
router.get("/:hostelID/rooms", authenticate, async (req, res) => {
  if (isNaN(req.params.hostelID)) {
    return res.status(400).json({
      success: false,
      message: "Invalid hostelID",
    });
  }
  try {
    const [rows] = await db.query(
      `SELECT r.*, b.BlockName, h.HostelName,
              (r.Capacity - r.OccupiedSeats) AS FreeSeats
         FROM ROOM r
         JOIN BLOCK  b ON r.BlockID  = b.BlockID
         JOIN HOSTEL h ON b.HostelID = h.HostelID
        WHERE h.HostelID = ?
        ORDER BY b.BlockName, r.RoomNo`,
      [req.params.hostelID],
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST create hostel ─────────────────────────────────────────
router.post("/", authenticate, authorizeRoles("Admin"), async (req, res) => {
  const { HostelName, Type, TotalBlocks } = req.body;
  if (!HostelName || HostelName.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Invalid hostel name",
    });
  }

  if (!Type || !["Boys", "Girls"].includes(Type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid hostel type",
    });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO HOSTEL (HostelName, Type, TotalBlocks) VALUES (?,?,?)",
      [HostelName, Type, TotalBlocks || 1],
    );
    res.status(201).json({ success: true, hostelID: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── POST add room ──────────────────────────────────────────────
router.post(
  "/:hostelID/blocks/:blockID/rooms",
  authenticate,
  authorizeRoles("Admin", "Warden"),

  async (req, res) => {
    if (isNaN(req.params.hostelID) || isNaN(req.params.blockID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs",
      });
    }
    const { RoomNo, Capacity, RoomType } = req.body;
    const { blockID } = req.params;
    if (!RoomNo || RoomNo.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Room number required",
      });
    }

    if (Capacity && Capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid capacity",
      });
    }
    try {
      const [result] = await db.query(
        "INSERT INTO ROOM (BlockID, RoomNo, Capacity, RoomType) VALUES (?,?,?,?)",
        [blockID, RoomNo, Capacity || 2, RoomType || "Double"],
      );
      res.status(201).json({ success: true, roomID: result.insertId });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({
          success: false,
          message: "Room already exists in this block.",
        });
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

module.exports = router;
