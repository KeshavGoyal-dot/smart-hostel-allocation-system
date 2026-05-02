//src/routes/auth.js
const router = require("express").Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

// ================= ADMIN LOGIN =================

router.post(
  "/login",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const [rows] = await db.query("SELECT * FROM STAFF WHERE Username = ?", [
        username,
      ]);

      if (rows.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });

      const user = rows[0];

      const match = await bcrypt.compare(password, user.Password);
      if (!match)
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });

      const token = jwt.sign(
        { id: user.StaffID, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.json({ success: true, token });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
);

// ================= STUDENT LOGIN =================

router.post(
  "/student-login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;

    try {
      const [rows] = await db.query("SELECT * FROM STUDENT WHERE Email = ?", [
        email,
      ]);

      if (rows.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });

      const student = rows[0];

      const match = await bcrypt.compare(password, student.Password);
      if (!match)
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });

      const token = jwt.sign(
        { id: student.StudentID, role: "Student" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.json({ success: true, token });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
);

module.exports = router;
