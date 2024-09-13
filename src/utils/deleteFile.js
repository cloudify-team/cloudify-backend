const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Item = require("../database/schemas/itemSchema");

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const deleteFile = async (id, filePath) => {
  console.log(filePath);
  try {
    const deleteParams = {
      Bucket: "hafisroshan",
      Key: filePath,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    await Item.findOneAndDelete({ _id: id });
  } catch (err) {
    console.error("Error deleting file", err);
    throw new Error(`Failed to delete file: ${err.message}`);
  }
};

module.exports = { deleteFile };
