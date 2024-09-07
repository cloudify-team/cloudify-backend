const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../../database/schemas/userSchema.js");
const sendMail = require("../../utils/sendMail.js");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const resetPasswordTemplatePath = path.join(
  __dirname,
  "../../emailTemplates/resetPassword.html",
);

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

module.exports = router;
