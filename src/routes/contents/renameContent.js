const express = require("express");
const mongoose = require("mongoose");

const verifyToken = require("../../middleware/verifyToken");
const { renameItem } = require("../../utils/renameItem");
const Item = require("../../database/schemas/itemSchema");
const { getUniqueFileName } = require("../../utils/uniqueItemName");

const router = express.Router();

router.put("/rename", verifyToken, async (req, res) => {
  const { _id, newName } = req.body;

  const errors = [];

  if (!_id) {
    errors.push({ field: "email", error: "Email is required." });
  }
  if (!newName) {
    errors.push({ field: "password", error: "Password is required." });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const item = await Item.findById(new mongoose.Types.ObjectId(_id));

    if (!item) {
      return res.status(400).send({
        success: false,
        errors: [{ field: "_id", error: "Invalid _id provided" }],
      });
    }
    if (item.name === newName) {
      return res.status(400).json({
        message: "The new name is the same as the current name.",
      });
    }

    const fileNameRegex = /[<>:"/\\|?*]/g;
    const sanitizedName = newName.replace(fileNameRegex, "_");
    const uniqueFileName = await getUniqueFileName(
      item.parent_folder,
      sanitizedName,
      "file",
    );

    await renameItem(item, uniqueFileName);
    return res.status(200).send({
      success: true,
      message: `Item renamed succesfully.`,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
