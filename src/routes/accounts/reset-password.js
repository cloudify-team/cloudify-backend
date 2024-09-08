const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema.js");

router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const errors = [];

    if (!resetToken) {
      errors.push({ field: "resetToken", error: "Reset token is required." });
    }

    if (!newPassword) {
      errors.push({ field: "newPassword", error: "New password is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const decoded = await new Promise((resolve) => {
      jwt.verify(resetToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({
              success: false,
              errors: [{ field: "resetToken", error: "Token has expired." }],
            });
          }
          return res.status(401).json({
            success: false,
            errors: [{ field: "resetToken", error: "Invalid token." }],
          });
        }
        resolve(decoded);
      });
    });

    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            field: "newPassword",
            error:
              "Password must be at least 8 characters long, include one uppercase letter and one special character.",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: decoded.email },
      { $set: { password: hashedPassword } },
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;
