const express = require("express");
const { uploadFile } = require("../../utils/upload");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  const { parent_folder, owner_id, name } = req.body;
  const file = req.file;

  if (!file || !name || !parent_folder) {
    return res
      .status(400)
      .send({ message: "Missing file, name, or parent_folder" });
  }

  try {
    const result = await uploadFile(file, name, owner_id, parent_folder);
    res.send({ message: "File uploaded successfully", result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
