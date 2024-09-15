const {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const User = require("../database/schemas/userSchema");
const mongoose = require("mongoose");

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const deleteAllFileVersions = async (bucket, key) => {
  try {
    const listParams = {
      Bucket: bucket,
      Prefix: key,
    };
    const listedObjects = await s3Client.send(
      new ListObjectVersionsCommand(listParams),
    );

    if (listedObjects.Versions && listedObjects.Versions.length > 0) {
      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: listedObjects.Versions.map((version) => ({
            Key: version.Key,
            VersionId: version.VersionId,
          })),
        },
      };
      await s3Client.send(new DeleteObjectsCommand(deleteParams));
    }
  } catch (error) {
    console.error("Error deleting file versions:", error);
    throw new Error(
      `Failed to delete existing file versions: ${error.message}`,
    );
  }
};

const uploadAvatar = async (file, fileName, userId) => {
  try {
    const contentType = mime.lookup(fileName) || "application/octet-stream";

    await deleteAllFileVersions("hafisroshan", fileName);

    const uploadParams = {
      Bucket: "hafisroshan",
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    let version = new Date().getTime();

    await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          "avatar.status": true,
          "avatar.version": version,
        },
      },
    );

    return {
      success: true,
      message: "Profile photo updated succesfully.",
      avatar: `${fileName}?v=${version}`,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw new Error(`Error uploading file: ${err.message}`);
  }
};

module.exports = { uploadAvatar };
