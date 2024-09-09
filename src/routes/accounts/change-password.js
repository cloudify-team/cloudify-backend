const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../../database/schemas/userSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const errors = [];

    if (!oldPassword) {
      errors.push({ field: "oldPassword", error: "Old password is required." });
    }
    if (!newPassword) {
      errors.push({ field: "newPassword", error: "New password is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        errors: [{ field: "user", error: "No user found." }],
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "oldPassword", error: "Incorrect old password." }],
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            field: "newPassword",
            error: "New password cannot be the same as the old password.",
          },
        ],
      });
    }

    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        errors: [
          {
            field: "newPassword",
            error:
              "Invalid password. Must be at least 8 characters long, include at least one uppercase letter and one special character.",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
