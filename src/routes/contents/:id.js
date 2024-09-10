const express = require("express");
const router = express.Router();
const Item = require("../../database/schemas/itemSchema");
const verifyToken = require("../../middleware/verifyToken");

router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    let content;

    if (id === "home") {
      content = await Item.find({
        parent_folder: "null",
        owner_id: req.userId,
      });
    } else {
      content = await Item.find({
        parent_folder: id,
        owner_id: req.userId,
      });
    }

    if (!content.length) {
      return res.status(404).send({ message: "No content found" });
    }

    res.send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
