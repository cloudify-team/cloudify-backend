const {
  S3Client,
  PutBucketLifecycleConfigurationCommand,
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
    const params = {
      Bucket: "hafisroshan",
      LifecycleConfiguration: {
        Rules: [
          {
            ID: `DeleteAfterOneDay-${folderId}`,
            Prefix: folderPath,
            Status: "Enabled",
            Expiration: {
              Days: 1,
            },
          },
        ],
      },
    };

    const command = new PutBucketLifecycleConfigurationCommand(params);
    await s3Client.send(command);

    await Item.deleteMany({
      path: { $regex: folderId },
    });

    return {
      message:
        "Lifecycle policy set and folder marked for deletion in MongoDB.",
    };
  } catch (error) {
    throw new Error(`Error deleting folder: ${error.message}`);
  }
};

module.exports = { deleteFolder };
