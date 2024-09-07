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

module.exports = router;
