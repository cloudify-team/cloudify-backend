const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");

router.post("/delete", verifyToken, async (req, res) => {
  const body = req.body;
  try {
    if (body && body._id) {
      const folder = await Item.findOneAndDelete({
        _id: body._id,
        type: "folder",
      });

      if (folder) {
        res.send({ message: "Folder deleted successfully", folder });
      } else {
        res.status(404).send({ message: "Folder not found" });
      }
    } else {
      res.status(400).send({ message: "Invalid data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error deleting folder", error: error.message });
  }
});

module.exports = router;
