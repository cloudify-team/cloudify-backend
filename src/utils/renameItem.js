const {
  CopyObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const Item = require("../database/schemas/itemSchema");
const s3Client = require("./s3Client");
const path = require("path");

const renameItem = async (item, newName) => {
  try {
    const itemId = item._id;
    if (item.type === "folder") {
      await Item.findOneAndUpdate(
        {
          _id: itemId,
        },
        {
          $set: {
            name: newName,
          },
        },
      );
    } else if (item.type === "file") {
      const newKey = path.join(path.dirname(item.path), newName);
      // change file name in db
      const updatedItem = await Item.findOneAndUpdate(
        {
          _id: itemId,
        },
        {
          $set: {
            name: newName,
            path: newKey,
          },
        },
      );
      console.log(updatedItem);
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: "hafisroshan",
          CopySource: `hafisroshan/${item.path}`,
          Key: newKey,
        }),
      );

      // Delete the old file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: "hafisroshan",
          Key: item.path,
        }),
      );
    }
  } catch (error) {
    console.error("Error renaming file/folder", error);
    throw new Error(`Failed to rename file/folder: ${error.message}`);
  }
};

module.exports = { renameItem };
