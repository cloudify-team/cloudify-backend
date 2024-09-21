const {
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const Item = require("../database/schemas/itemSchema");
const User = require("../database/schemas/userSchema");
const s3Client = require("./s3Client");

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

    const item = await Item.findOne({ _id: id });
    if (item) {
      const itemSize = item.size;
      const userId = item.owner_id;

      await Item.findOneAndDelete({ _id: id });

      await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { usedStorage: -itemSize } },
      );
    }

    return deleteResult;
  } catch (error) {
    console.error("Error deleting file", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

module.exports = { deleteFile };
