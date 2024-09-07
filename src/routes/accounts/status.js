const router = require("express").Router();
const User = require("../../database/schemas/userSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

router.post("/status", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    res.status(200).json({
      valid: true,
      message: "Token is valid",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
