const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema.js");

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "token", error: "Verification token is required." }],
      });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "token", error: "Invalid or expired token." }],
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const login_token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token: login_token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
});

module.exports = router;
