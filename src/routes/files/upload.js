const express = require("express");
const { uploadFile } = require("../../utils/upload");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  const { parent_folder, name } = req.body;
  const file = req.file;
  const owner_id = req.userId;

  if (!file || !name) {
    return res.status(400).send({ message: "Missing file or name" });
  }

  const fileNameRegex = /[<>:"/\\|?*]/g;
  const sanitizedName = name.replace(fileNameRegex, "_");

  try {
    const result = await uploadFile(
      file,
      sanitizedName,
      owner_id,
      parent_folder || null,
    );
    res.status(201).send({ message: "File uploaded successfully", result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
