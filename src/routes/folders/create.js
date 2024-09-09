const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");
const findPath = require("../../utils/findPath.js");

router.get("/fetch", async (req, res) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/create", verifyToken, async (req, res) => {
  const { name, parent_folder } = req.body;

  if (!name) {
    return res.status(400).send({
      success: false,
      errors: [{ field: "name", error: "Folder name is required." }],
    });
  }

  try {
    const folder = await Item.create({
      type: "folder",
      name,
      size: "0",
      total_files: "0",
      access_control: [],
      owner_id: req.userId,
      parent_folder: parent_folder || null,
      path: "",
    });

    folder.path = await findPath(folder._id, req.userId);
    folder.save();

    res.status(201).json(folder);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

module.exports = router;
