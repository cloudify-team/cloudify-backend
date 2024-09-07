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
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    //Username validation using regex
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          "Invalid username. Only letters, numbers, underscores, and hyphens are allowed.",
      });
    }

    // password validation using regex
    const passwordRegex = /(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Invalid password. Password must be at least 8 characters long, include at least one uppercase letter and one special character.",
      });
    }

    const lowercaseUsername = username.toLowerCase();
    const existingUser = await User.findOne({
      $or: [{ email }, { lowercaseUsername }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(409)
          .json({ message: "User with this email already exists." });
      } else if (existingUser.username === lowercaseUsername) {
        return res.status(409).json({ message: "Username is already taken." });
      }
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

    const verificationLink = `${req.protocol}://${req.get("host")}/verify-email?token=${verificationToken}`;

    const emailTemplate = fs.readFileSync(verifyEmailTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { verificationLink });

    const result = await sendMail(email, "Verify your mail", renderedHtml);

    if (result.success) {
      res.status(200).json({ message: "Verification email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
