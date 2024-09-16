const express = require("express");
const { S3Client, ListObjectVersionsCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const router = express.Router();

router.get("/fetch", async (req, res) => {
  const listParams = {
    Bucket: "hafisroshan",
  };

  try {
    const data = await s3Client.send(new ListObjectVersionsCommand(listParams));
    console.log(data);

    const files = data.Versions.map((file) => {
      const url = `https://${listParams.Bucket}.s3.us-east-005.backblazeb2.com/${file.Key}`;
      return {
        fileName: file.Key,
        versionId: file.VersionId,
        url,
        lastModified: file.LastModified,
        size: file.Size,
        isLatest: file.IsLatest,
      };
    });

    res.json({ files });
  } catch (err) {
    res.status(500).send(`Error fetching file versions: ${err.message}`);
  }
});

module.exports = router;
