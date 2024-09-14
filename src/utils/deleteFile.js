const {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
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
  try {
    const listParams = {
      Bucket: "hafisroshan",
      Prefix: filePath,
    };

    const listedVersions = await s3Client.send(
      new ListObjectVersionsCommand(listParams),
    );

    if (!listedVersions.Versions || listedVersions.Versions.length === 0) {
      await Item.findOneAndDelete({ _id: id });
      return { message: "File deleted from the database." };
    }

    const deleteParams = {
      Bucket: "hafisroshan",
      Delete: {
        Objects: listedVersions.Versions.map((item) => ({
          Key: item.Key,
          VersionId: item.VersionId,
        })),
      },
    };

    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand(deleteParams),
    );

    await Item.findOneAndDelete({ _id: id });

    return deleteResult;
  } catch (error) {
    console.error("Error deleting file", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = { deleteFile };
