const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

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
  const body = req.body;
  try {
    if (body) {
      const folder = await Item.create({
        type: "folder",
        name: body.name,
        size: "0",
        total_files: "0",
        access_control: [],
        owner_id: req.userId,
        parent_folder: body.parent_folder,
        path: body.path,
      });
      res.send(folder);
    } else {
      res.status(400).send({ message: "No data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

module.exports = router;
