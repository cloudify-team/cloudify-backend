const Item = require("../database/schemas/itemSchema.js");
const mongoose = require("mongoose");

async function pathName(path) {
  try {
    let paths = path.split("/");
    let pathNames = [];
    paths.shift();
    console.log(paths);
    for (const folderId of paths) {
      let folder = await Item.findById(new mongoose.Types.ObjectId(folderId));

      if (!folder) {
        throw new Error(`Folder with ID ${folderId} not found`);
      }

      pathNames.push({
        name: folder.name,
        _id: folder._id,
      });
    }

    return pathNames;
  } catch (error) {
    throw new Error(`Error finding path: ${error.message}`);
  }
}

module.exports = pathName;
