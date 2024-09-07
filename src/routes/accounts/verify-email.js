const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema.js");

router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const login_token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    return res
      .status(200)
      .json({ message: "Email verified successfully.", token: login_token });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
