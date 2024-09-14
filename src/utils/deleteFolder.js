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

const deleteFolder = async (folderId, folderPath) => {
  try {
    const listParams = {
      Bucket: "hafisroshan",
      Prefix: folderPath,
    };

    const listedObjects = await s3Client.send(
      new ListObjectVersionsCommand(listParams),
    );

    if (!listedObjects.Versions || listedObjects.Versions.length === 0) {
      await Item.deleteMany({ path: { $regex: folderId } });
      return { message: "Folder deleted from the database." };
    }

    const deleteParams = {
      Bucket: "hafisroshan",
      Delete: {
        Objects: listedObjects.Versions.map((item) => ({
          Key: item.Key,
          VersionId: item.VersionId,
        })),
      },
    };

    const deleteResult = await s3Client.send(
      new DeleteObjectsCommand(deleteParams),
    );

    await Item.deleteMany({ path: { $regex: folderId } });

    return deleteResult;
  } catch (error) {
    throw new Error(`Error deleting folder: ${error.message}`);
  }
};

module.exports = { deleteFolder };
