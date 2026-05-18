const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const ADMIN_EMAIL = "dimahussein748@gmail.com";

// ================= MAIL CONFIG =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!/^\d+$/.test(phone)) {
    return res.status(400).json({
      message: "Phone number must contain numbers only",
    });
  }

  if (phone.length < 7) {
    return res.status(400).json({
      message: "Phone number must be at least 7 digits",
    });
  }

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(){}:"<>?])[A-Za-z\d!@#$%^&*(){}:"<>?]{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    });
  }

  db.query("SELECT * FROM users WHERE Email = ?", [email], async (err, result) => {
    if (err) {
      console.error("REGISTER SELECT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const role =
        email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "Admin" : "User";

      db.query(
        "INSERT INTO users (Name, Email, Password, Phone, Role, is_verified, verification_code, reset_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [fullName, email, hashedPassword, phone, role, 0, null, null],
        (insertErr) => {
          if (insertErr) {
            console.error("REGISTER INSERT ERROR:", insertErr);
            return res.status(500).json({ message: "Insert failed" });
          }

          return res.status(201).json({
            message: "Account created successfully",
          });
        }
      );
    } catch (hashError) {
      console.error("PASSWORD HASH ERROR:", hashError);
      return res.status(500).json({ message: "Password hashing failed" });
    }
  });
});

// ================= SEND ACCOUNT VERIFICATION CODE =================
router.post("/send-code", async (req, res) => {
  try {
    const { email, phone, method } = req.body;

    console.log("SEND CODE BODY:", req.body);

    if (!method) {
      return res.status(400).json({ message: "Method is required" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (method === "email") {
      db.query(
        "UPDATE users SET verification_code = ? WHERE Email = ?",
        [code, email],
        async (err, result) => {
          if (err) {
            console.error("SEND CODE EMAIL DB ERROR:", err);
            return res.status(500).json({ message: "Database error" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
          }

          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Verification Code",
              text: `Your verification code is: ${code}`,
            });

            return res.status(200).json({
              message: "Code sent to email",
            });
          } catch (mailError) {
            console.error("MAIL ERROR:", mailError);
            return res.status(500).json({
              message: "Email could not be sent",
            });
          }
        }
      );
      return;
    }

    if (method === "whatsapp") {
      db.query(
        "UPDATE users SET verification_code = ? WHERE Phone = ?",
        [code, phone],
        (err, result) => {
          if (err) {
            console.error("SEND CODE WHATSAPP DB ERROR:", err);
            return res.status(500).json({ message: "Database error" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
          }

          console.log("WhatsApp verification code:", code);

          return res.status(200).json({
            message: "Code sent to WhatsApp (check terminal)",
          });
        }
      );
      return;
    }

    return res.status(400).json({ message: "Invalid method" });
  } catch (error) {
    console.error("SEND CODE ROUTE ERROR:", error);
    return res.status(500).json({
      message: "Internal server error in send-code",
    });
  }
});

// ================= VERIFY ACCOUNT CODE =================
router.post("/verify-code", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  db.query(
    "SELECT * FROM users WHERE Email = ? AND verification_code = ?",
    [email, code],
    (err, result) => {
      if (err) {
        console.error("VERIFY CODE SELECT ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid code" });
      }

      db.query(
        "UPDATE users SET is_verified = 1, verification_code = NULL WHERE Email = ?",
        [email],
        (updateErr) => {
          if (updateErr) {
            console.error("VERIFY CODE UPDATE ERROR:", updateErr);
            return res.status(500).json({ message: "Verification update failed" });
          }

          return res.status(200).json({
            message: "Account verified successfully",
          });
        }
      );
    }
  );
});

// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE Email = ?", [email], async (err, result) => {
    if (err) {
      console.error("LOGIN SELECT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    if (user.is_verified === 0) {
      return res.status(403).json({
        message: "Please verify your account first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.User_ID,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.User_ID,
        name: user.Name,
        email: user.Email,
        role: user.Role,
      },
    });
  });
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.query("SELECT * FROM users WHERE Email = ?", [email], async (err, result) => {
    if (err) {
      console.error("FORGOT PASSWORD SELECT ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    db.query(
      "UPDATE users SET reset_code = ? WHERE Email = ?",
      [resetCode, email],
      async (updateErr) => {
        if (updateErr) {
          console.error("FORGOT PASSWORD UPDATE ERROR:", updateErr);
          return res.status(500).json({ message: "Failed to save reset code" });
        }

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reset Password Code",
            text: `Your password reset code is: ${resetCode}`,
          });

          return res.status(200).json({
            message: "Reset code sent to your email",
          });
        } catch (mailError) {
          console.error("RESET MAIL ERROR:", mailError);
          return res.status(500).json({
            message: "Email could not be sent",
          });
        }
      }
    );
  });
});

// ================= VERIFY RESET CODE =================
router.post("/verify-reset-code", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  db.query(
    "SELECT * FROM users WHERE Email = ? AND reset_code = ?",
    [email, code],
    (err, result) => {
      if (err) {
        console.error("VERIFY RESET CODE ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid reset code" });
      }

      return res.status(200).json({
        message: "Code verified successfully",
      });
    }
  );
});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      message: "Email and new password are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET Password = ?, reset_code = NULL WHERE Email = ?",
      [hashedPassword, email],
      (err) => {
        if (err) {
          console.error("RESET PASSWORD UPDATE ERROR:", err);
          return res.status(500).json({ message: "Failed to update password" });
        }

        return res.status(200).json({
          message: "Password reset successfully",
        });
      }
    );
  } catch (error) {
    console.error("RESET PASSWORD HASH ERROR:", error);
    return res.status(500).json({ message: "Hashing failed" });
  }
});

module.exports = router;