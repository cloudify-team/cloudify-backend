const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");
const verifyToken = require("../../middleware/verifyToken.js");
const pathName = require("../../utils/pathName.js");
const mongoose = require("mongoose");

router.post("/parent", verifyToken, async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).send({
      success: false,
      errors: [{ field: "_id", error: "Folder ID is required." }],
    });
  }

  try {
    let folder = await Item.findById(new mongoose.Types.ObjectId(_id));

    const parents = await pathName(folder.path);

    res.send(parents);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error fetching parents", error: error.message });
  }
});

module.exports = router;
