const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
      errors.push({ field: "email", error: "Email is required." });
    }
    if (!password) {
      errors.push({ field: "password", error: "Password is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findOne({ email });
    if (!user) {
      errors.push({ field: "email", error: "Email not registered." });
    }

    if (errors.length > 0) {
      return res.status(401).json({ success: false, errors });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.push({ field: "password", error: "Incorrect password." });
    }

    if (errors.length > 0) {
      return res.status(401).json({ success: false, errors });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        errors: [{ field: "email", error: "Account not verified." }],
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
