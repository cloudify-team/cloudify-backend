const express = require("express");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const verifyToken = require("../../middleware/verifyToken");

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const router = express.Router();

router.get("/fetch", verifyToken, async (req, res) => {
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
