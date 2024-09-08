const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../../database/schemas/userSchema.js");
const sendMail = require("../../utils/sendMail.js");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const verifyEmailTemplatePath = path.join(
  __dirname,
  "../../emailTemplates/verifyEmail.html",
);

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    const errors = [];

    if (!username) {
      errors.push({ field: "username", error: "Username is required." });
    }
    if (!email) {
      errors.push({ field: "email", error: "Email is required." });
    }
    if (!password) {
      errors.push({ field: "password", error: "Password is required." });
    }
    if (!fullName) {
      errors.push({ field: "fullName", error: "Full name is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Username validation using regex
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      errors.push({
        field: "username",
        error:
          "Invalid username. Only letters, numbers, underscores, and hyphens are allowed.",
      });
    }

    // Password validation using regex
    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(password)) {
      errors.push({
        field: "password",
        error:
          "Invalid password. Password must be at least 8 characters long, include at least one uppercase letter and one special character.",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const lowercaseUsername = username.toLowerCase();
    const emailCount = await User.countDocuments({ email });
    const usernameCount = await User.countDocuments({
      username: lowercaseUsername,
    });

    if (emailCount > 0) {
      errors.push({
        field: "email",
        error: "User with this email already exists.",
      });
    }
    if (usernameCount > 0) {
      errors.push({ field: "username", error: "Username is already taken." });
    }

    if (errors.length > 0) {
      return res.status(409).json({ success: false, errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const newUser = new User({
      username: lowercaseUsername,
      email,
      fullName,
      password: hashedPassword,
      verificationToken,
    });

    await newUser.save();

    const verificationLink = `${req.protocol}://${req.get(
      "host",
    )}/verify-email?token=${verificationToken}`;

    const emailTemplate = fs.readFileSync(verifyEmailTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { verificationLink });

    const result = await sendMail(email, "Verify your mail", renderedHtml);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send verification email" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
