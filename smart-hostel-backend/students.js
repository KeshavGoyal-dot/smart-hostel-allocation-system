// src/routes/students.js
const bcrypt = require("bcryptjs");
const router = require("express").Router();
const db = require("../config/db");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// ── GET all students ──────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  if (req.user.role === "Student") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  try {
    const [rows] = await db.query(
      `SELECT s.*, 
              a.AllocID, a.RoomID, a.AllocDate, a.Status AS AllocStatus
         FROM STUDENT s
         LEFT JOIN ALLOCATION a ON s.StudentID = a.StudentID AND a.Status = 'Active'
        ORDER BY s.Year DESC, s.Name`,
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── GET single student ────────────────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  if (req.user.role === "Student" && req.user.id != req.params.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  try {
    const [rows] = await db.query(
      `SELECT s.*,
              a.AllocID, a.RoomID, a.AllocDate, a.Status AS AllocStatus,
              r.RoomNo, b.BlockName, h.HostelName
         FROM STUDENT s
         LEFT JOIN ALLOCATION a ON s.StudentID = a.StudentID AND a.Status = 'Active'
         LEFT JOIN ROOM r        ON a.RoomID = r.RoomID
         LEFT JOIN BLOCK b       ON r.BlockID = b.BlockID
         LEFT JOIN HOSTEL h      ON b.HostelID = h.HostelID
        WHERE s.StudentID = ?`,
      [req.params.id],
    );
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Student not found." });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ── POST create student ───────────────────────────────────────

router.post(
  "/",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  [
    body("StudentID").notEmpty(),
    body("Email").isEmail(),
    body("Year").isInt({ min: 1, max: 4 }),
    body("Password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 character"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const {
      StudentID,
      Name,
      Branch,
      Year,
      Gender,
      Category,
      Email,
      Phone,
      Password,
    } = req.body;
    if (
      !StudentID ||
      !Name ||
      !Branch ||
      !Year ||
      !Gender ||
      !Email ||
      !Password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing." });
    }
    try {
      const hashedPassword = await bcrypt.hash(Password, 10);
      await db.query(
        `INSERT INTO STUDENT (StudentID, Name, Branch, Year, Gender, Category, Email, Phone, Password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`,
        [
          StudentID,
          Name,
          Branch,
          Year,
          Gender,
          Category || "General",
          Email,
          Phone || null,
          hashedPassword,
        ],
      );
      res
        .status(201)
        .json({ success: true, message: "Student registered successfully." });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({
          success: false,
          message: "StudentID or Email already exists.",
        });
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
);

// ── PUT update student ────────────────────────────────────────
router.put(
  "/:id",
  authenticate,
  authorizeRoles("Admin", "Warden"),
  async (req, res) => {
    const { Name, Branch, Year, Gender, Category, Email, Phone } = req.body;
    try {
      const [result] = await db.query(
        `UPDATE STUDENT SET Name=?, Branch=?, Year=?, Gender=?, Category=?, Email=?, Phone=?
        WHERE StudentID = ?`,
        [Name, Branch, Year, Gender, Category, Email, Phone, req.params.id],
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "Student not found." });
      res.json({ success: true, message: "Student updated." });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
);

// ── DELETE student ────────────────────────────────────────────
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const [result] = await db.query(
        "DELETE FROM STUDENT WHERE StudentID = ?",
        [req.params.id],
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "Student not found." });
      res.json({ success: true, message: "Student deleted." });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
);

module.exports = router;
