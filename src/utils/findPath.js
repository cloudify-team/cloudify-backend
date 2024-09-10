const Item = require("../database/schemas/itemSchema.js");

async function findPath(folderId, userId) {
  try {
    let path = [];
    if (!folderId) {
      return userId;
    }

    let currentFolder = await Item.findById(folderId);

    if (!currentFolder) {
      throw new Error("Folder not found");
    }

    while (currentFolder) {
      path.unshift(currentFolder._id.toString());
      if (currentFolder.parent_folder) {
        currentFolder = await Item.findById(currentFolder.parent_folder);
      } else {
        break;
      }
    }

    path.unshift(userId);
    console.log(userId);
    return path.join("/");
  } catch (error) {
    throw new Error(`Error finding path: ${error.message}`);
  }
}

module.exports = findPath;