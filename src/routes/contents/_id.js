const express = require("express");
const router = express.Router();
const Item = require("../../database/schemas/itemSchema");
const verifyToken = require("../../middleware/verifyToken");
const mongoose = require("mongoose");

router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    let content;

    if (id === "home") {
      content = await Item.find({
        parent_folder: null,
        owner_id: req.userId,
      });
    } else {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid folder ID format" });
      }

      const folder = await Item.countDocuments({
        _id: new mongoose.Types.ObjectId(id),
        owner_id: req.userId,
        type: "folder",
      });

      if (folder.length === 0) {
        return res.status(404).send({ message: "Folder not found" });
      }

      content = await Item.find({
        parent_folder: id,
        owner_id: req.userId,
      });
    }

    res.send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
