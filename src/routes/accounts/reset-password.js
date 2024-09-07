const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema.js");

router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(403).json({ message: "All fields are required." });
    }

    const decoded = await new Promise((resolve) => {
      jwt.verify(resetToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res
              .status(401)
              .json({ valid: false, message: "Token has expired" });
          }
          return res.status(401).json({
            valid: false,
            message: "Invalid token",
            error: err.message,
          });
        }
        resolve(decoded);
      });
    });

    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Invalid password. Password must be at least 8 characters long, include at least one uppercase letter and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      {
        email: decoded.email,
      },
      {
        $set: {
          password: hashedPassword,
        },
      },
    );

    return res.status(200).json({ message: "Password changed succesfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
