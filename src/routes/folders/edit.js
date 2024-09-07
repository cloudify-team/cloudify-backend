const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

router.post("/edit", verifyToken, async (req, res) => {
  const body = req.body;
  try {
    if (body && body._id) {
      const folder = await Item.findOneAndUpdate(
        { _id: body._id, type: "folder" },
        {
          $set: {
            name: body.name,
            access_control: body.access_control,
            parent_folder: body.parent_folder,
          },
        },
        { new: true },
      );

      if (folder) {
        res.send(folder);
      } else {
        res.status(404).send({ message: "Folder not found" });
      }
    } else {
      res.status(400).send({ message: "Invalid data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error editing folder", error: error.message });
  }
});

module.exports = router;
