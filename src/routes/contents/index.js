const express = require("express");
const router = express.Router();
const Item = require("../../database/schemas/itemSchema");
const verifyToken = require("../../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const contents = await Item.find({ owner_id: req.userId });
    res.send(contents);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;