const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Item = require("../database/schemas/itemSchema");

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (file, fileName, ownerId, parentFolderId) => {
  try {
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    const uploadParams = {
      Bucket: "hafisroshan",
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));

    const fileMetadata = {
      type: "file",
      name: fileName,
      format: contentType,
      size: file.length,
      owner_id: ownerId,
      parent_folder: parentFolderId,
      path: fileName,
    };

    const savedFile = await Item.create(fileMetadata);

    return { success: true, data, savedFile };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw new Error(`Error uploading file: ${err.message}`);
  }
};

module.exports = { uploadFile };
