// src/routes/waitlist.js
const router = require("express").Router();
const db = require("./db");
const { authenticate, authorizeRoles } = require("./authmiddleware");

// ── GET full waiting list (priority order) ────────────────────
router.get(
  "/",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT w.WL_ID, w.RequestDate, w.Priority,
              s.StudentID, s.Name, s.Branch, s.Year, s.Gender, s.Category
         FROM WAITING_LIST w
         JOIN STUDENT s ON w.StudentID = s.StudentID
        ORDER BY w.Priority DESC, w.RequestDate ASC`, // Sorting by priority first, then request date (FIFO within same priority)
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

// ── DELETE remove student from waiting list ───────────────────
router.delete(
  "/:studentID",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    const studentID = req.params.studentID;

    if (!studentID || typeof studentID !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid studentID",
      });
    }
    try {
      const [result] = await db.query(
        "DELETE FROM WAITING_LIST WHERE StudentID = ?",
        [req.params.studentID],
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "Student not on waiting list." });
      res.json({ success: true, message: "Removed from waiting list." });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },
);

module.exports = router;
