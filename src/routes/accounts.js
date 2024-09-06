const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../database/schemas/userSchema.js");
const verifyToken = require("../middleware/verifyToken.js");

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

    // Sending verification email
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationLink = `${req.protocol}://${req.get("host")}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Please verify your email by clicking on the following link:</p>
                 <a href="${verificationLink}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: "Account not verified" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
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
    res.status(500).send(error);
  }
});

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
