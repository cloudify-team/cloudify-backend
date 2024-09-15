const router = require("express").Router();
const verifyToken = require("../../middleware/verifyToken.js");
const multer = require("multer");
const sharp = require("sharp");
const storage = multer.memoryStorage();
const { uploadAvatar } = require("../../utils/uploadAvatar");
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid file type. Only image files are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

router.post(
  "/avatar",
  verifyToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "No file uploaded." });
      }
      const outputBuffer = await sharp(req.file.buffer)
        .resize(128, 128)
        .webp()
        .toBuffer();

      const avatarKey = `avatars/${req.userId}.webp`;

      const data = await uploadAvatar(outputBuffer, avatarKey, req.userId);

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
);

module.exports = router;
