// src/routes/allocations.js
const router = require("express").Router();
const db = require("./db");
const { authenticate, authorizeRoles } = require("./authmiddleware");

// ── GET all active allocations ────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.AllocID, a.AllocDate, a.Status,
              s.StudentID, s.Name, s.Branch, s.Year, s.Gender,
              r.RoomNo, r.RoomType, r.Capacity, r.OccupiedSeats,
              b.BlockName, h.HostelName
         FROM ALLOCATION a
         JOIN STUDENT s ON a.StudentID = s.StudentID
         JOIN ROOM    r ON a.RoomID    = r.RoomID
         JOIN BLOCK   b ON r.BlockID   = b.BlockID
         JOIN HOSTEL  h ON b.HostelID  = h.HostelID
        WHERE a.Status = 'Active'
        ORDER BY h.HostelName, b.BlockName, r.RoomNo`,
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post(
  "/apply",
  authenticate,
  authorizeRoles("Student"),
  async (req, res) => {
    const studentID = req.user.id;
    if (!studentID) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }
    try {
      // Check if already allocated
      const [existing] = await db.query(
        `SELECT * FROM ALLOCATION WHERE StudentID=? AND Status='Active'`,
        [studentID],
      );

      if (existing.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Already allocated" });
      }

      // Check if already in waiting list
      const [wl] = await db.query(
        `SELECT * FROM WAITING_LIST WHERE StudentID=?`,
        [studentID],
      );

      if (wl.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Already in waiting list" });
      }

      // Insert properly with dynamic priority
      await db.query(
        `INSERT INTO WAITING_LIST (StudentID, RequestDate, Priority)
         VALUES (
           ?, 
           NOW(), 
           fn_priority_score(
             (SELECT Year FROM STUDENT WHERE StudentID=?),
             (SELECT Category FROM STUDENT WHERE StudentID=?)
           )
         )`,
        [studentID, studentID, studentID],
      );

      res.json({
        success: true,
        message: "Applied successfully. Added to waiting list.",
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── POST allocate room to a student (calls sp_allocate_room) ──
router.post(
  "/allocate",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    const { studentID } = req.body;
    if (!studentID || typeof studentID !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid studentID",
      });
    }
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction(); //// Using transaction to ensure atomic allocation

      await conn.query("CALL sp_allocate_room(?, @result)", [studentID]);

      const [rows] = await conn.query("SELECT @result AS result");

      if (!rows || rows.length === 0 || !rows[0].result) {
        throw new Error("Procedure did not return result");
      }

      const result = rows[0].result;

      if (result.startsWith("ERROR")) {
        await conn.rollback();
        return res.status(400).json({ success: false, message: result });
      }

      await conn.commit();

      res.status(201).json({ success: true, message: result });
    } catch (err) {
      console.error("ALLOCATION ERROR:", err); // 👈 ADD THIS
      await conn.rollback();
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    } finally {
      conn.release();
    }
  },
);

// ── POST vacate a room (calls sp_vacate_room) ─────────────────
router.post(
  "/vacate",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    const { studentID } = req.body;
    if (!studentID || typeof studentID !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid studentID",
      });
    }

    try {
      await db.query("CALL sp_vacate_room(?, @result)", [studentID]);
      const [[resultRow]] = await db.query("SELECT @result AS result");
      const result = resultRow.result;

      if (result.startsWith("ERROR")) {
        return res.status(400).json({ success: false, message: result });
      }

      // After vacating, try to process waitlist
      await db.query("CALL sp_process_waitlist()");

      res.json({ success: true, message: result });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

// ── GET allocation history for a student ─────────────────────
router.get("/student/:studentID", authenticate, async (req, res) => {
  if (
    req.user.role === "Student" &&
    req.user.id !== Number(req.params.studentID)
  ) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    const [rows] = await db.query(
      `SELECT a.AllocID, a.AllocDate, a.Status,
              r.RoomNo, r.RoomType,
              b.BlockName, h.HostelName
         FROM ALLOCATION a
         JOIN ROOM   r ON a.RoomID  = r.RoomID
         JOIN BLOCK  b ON r.BlockID = b.BlockID
         JOIN HOSTEL h ON b.HostelID= h.HostelID
        WHERE a.StudentID = ?
        ORDER BY a.AllocDate DESC`,
      [req.params.studentID],
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
