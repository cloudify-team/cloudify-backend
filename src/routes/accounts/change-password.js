const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../../database/schemas/userSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(403).json({ message: "No user found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be same as the old password" });
    }

    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Invalid password. Password must be at least 8 characters long, include at least one uppercase letter and one special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed succesfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
