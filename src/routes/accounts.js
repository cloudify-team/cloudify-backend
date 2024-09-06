const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../database/schemas/userSchema.js");
const verifyToken = require("../middleware/verifyToken.js");
const sendMail = require("../utils/sendMail.js");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const verifyEmailTemplatePath = path.join(
  __dirname,
  "../emailTemplates/verifyEmail.html",
);
const resetPasswordTemplatePath = path.join(
  __dirname,
  "../emailTemplates/resetPassword.html",
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

router.post("/resend-email", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }
    if (!user.verificationToken) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const verificationLink = `${req.protocol}://${req.get("host")}/verify-email?token=${user.verificationToken}`;

    const emailTemplate = fs.readFileSync(verifyEmailTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { verificationLink });

    const result = await sendMail(email, "Verify your mail", renderedHtml);

    if (result.success) {
      res.status(200).json({ message: "Verification email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "Email not registered" });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetEmailLink = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

    const emailTemplate = fs.readFileSync(resetPasswordTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { resetEmailLink });

    const result = await sendMail(email, "Forgot Password", renderedHtml);

    if (result.success) {
      res
        .status(200)
        .json({ message: "Reset Password email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send verification email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/reset-password/verify", async (req, res) => {
  try {
    const { resetToken } = req.body;

    if (!resetToken) {
      return res.status(403).json({ message: "No token provided." });
    }

    await new Promise((resolve) => {
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

    return res.status(200).json({ valid: true, message: "Valid Token" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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
