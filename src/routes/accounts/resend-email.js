const router = require("express").Router();
const User = require("../../database/schemas/userSchema.js");
const sendMail = require("../../utils/sendMail.js");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const verifyEmailTemplatePath = path.join(
  __dirname,
  "../../emailTemplates/verifyEmail.html",
);

router.post("/resend-email", async (req, res) => {
  try {
    const { email } = req.body;
    const errors = [];

    if (!email) {
      errors.push({ field: "email", error: "Email is required." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "email", error: "Email not registered." }],
      });
    }

    if (!user.verificationToken) {
      return res.status(400).json({
        success: false,
        errors: [{ field: "email", error: "Account already verified." }],
      });
    }

    const verificationLink = `${req.protocol}://${req.get("host")}/verify-email?token=${user.verificationToken}`;

    const emailTemplate = fs.readFileSync(verifyEmailTemplatePath, "utf-8");
    const renderedHtml = ejs.render(emailTemplate, { verificationLink });

    const result = await sendMail(email, "Verify your mail", renderedHtml);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Verification email sent successfully.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send verification email.",
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
