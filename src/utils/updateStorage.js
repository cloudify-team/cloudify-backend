const { mongoose } = require("mongoose");
const User = require("../database/schemas/userSchema");

async function updateStorage(userID, fileSize) {
  try {
    const objectId = new mongoose.Types.ObjectId(userID);

    await User.findByIdAndUpdate(objectId, {
      $inc: {
        usedStorage: fileSize,
      },
    });
    return true;
  } catch (err) {
    throw new Error(`Error changing storage data: ${err.message}`);
  }
}

module.exports = { updateStorage };
