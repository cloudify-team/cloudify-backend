const express = require("express");
const { deleteFile } = require("../../utils/deleteFile");
const { deleteFolder } = require("../../utils/deleteFolder");
const Item = require("../../database/schemas/itemSchema");
const mongoose = require("mongoose");

const verifyToken = require("../../middleware/verifyToken");

const router = express.Router();

router.post("/delete", verifyToken, async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).send({
      success: false,
      errors: [{ field: "_id", error: "Item ID is required." }],
    });
  }

  try {
    const item = await Item.findById(new mongoose.Types.ObjectId(_id));

    if (!item) {
      return res.status(400).send({
        success: false,
        errors: [{ field: "_id", error: "Invalid _id provided" }],
      });
    }

    if (item.type === "file") {
      await deleteFile(item._id, item.path);
      return res.status(200).send({
        success: true,
        message: `${item.name} deleted succesfully.`,
      });
    } else if (item.type === "folder") {
      await deleteFolder(item._id, item.path);
      return res.status(200).send({
        success: true,
        message: `${item.name} deleted succesfully.`,
      });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
