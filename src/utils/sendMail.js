const nodemailer = require("nodemailer");

const sendMail = async (to, subject, htmlContent) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email", error };
  }
};

module.exports = sendMail;
