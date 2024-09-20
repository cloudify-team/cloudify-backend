const path = require("path");
const Item = require("../database/schemas/itemSchema"); // Your Item schema

async function getUniqueFilename(parentFolderId, filename, type) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  const contents = await Item.find({
    parent_folder: parentFolderId,
    name: { $regex: new RegExp(`^${basename}(\\(\\d+\\))?${ext}$`, "i") },
    type: type,
  });

  if (contents.length === 0) {
    return filename;
  }

  let maxVersion = 0;
  contents.forEach((item) => {
    const match = item.name.match(/\((\d+)\)/);
    if (match && match[1]) {
      const version = parseInt(match[1], 10);
      if (version > maxVersion) {
        maxVersion = version;
      }
    }
  });

  const newVersion = maxVersion + 1;
  return `${basename}(${newVersion})${ext}`;
}

module.exports = { getUniqueFilename };
