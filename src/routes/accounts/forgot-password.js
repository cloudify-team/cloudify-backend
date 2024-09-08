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
    const errors = [];

    if (!email) {
      errors.push({ field: "email", error: "Email is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.countDocuments({ email });
    if (user == 0) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "email", error: "Email not registered." }],
      });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetEmailLink = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

    const emailTemplate = fs.readFileSync(resetPasswordTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { resetEmailLink });

    const result = await sendMail(email, "Forgot Password", renderedHtml);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Reset Password email sent successfully.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send reset password email.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
});

module.exports = router;
