const { PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Item = require("../database/schemas/itemSchema");
const findPath = require("./findPath");
const s3Client = require("./s3Client");

const uploadFile = async (file, fileName, ownerId, parentFolderId) => {
  try {
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    const folderPath = await findPath(parentFolderId, ownerId);
    const filePath = `${folderPath}/${fileName}`;

    const uploadParams = {
      Bucket: "hafisroshan",
      Key: filePath,
      Body: file.buffer,
      ContentType: contentType,
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));

    const fileMetadata = {
      type: "file",
      name: fileName,
      format: contentType,
      size: file.size,
      owner_id: ownerId,
      parent_folder: parentFolderId,
      path: filePath,
    };

    const savedFile = await Item.create(fileMetadata);

    return { success: true, data, savedFile };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw new Error(`Error uploading file: ${err.message}`);
  }
};

module.exports = { uploadFile };
