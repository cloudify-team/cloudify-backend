const router = require("express").Router();
const jwt = require("jsonwebtoken");

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

module.exports = router;
