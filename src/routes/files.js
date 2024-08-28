const express = require("express");
const { uploadFile } = require("../utils/upload");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

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

router.get("/fetch", async (req, res) => {
  const listParams = {
    Bucket: "hafisroshan",
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(listParams));
    const files = data.Contents.map((file) => {
      const url = `https://${listParams.Bucket}.s3.us-east-005.backblazeb2.com/${file.Key}`;
      return { fileName: file.Key, url };
    });
    res.json({ files });
  } catch (err) {
    res.status(500).send(`Error fetching files: ${err.message}`);
  }
});

module.exports = router;
