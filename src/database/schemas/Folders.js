const mongoose = require("mongoose");

const folders = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    total_files: {
      type: String,
      required: true,
    },
    access_control: {
      type: Array,
    },
    owner_id: {
      type: String,
      required: true,
    },
    parent_folder: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Folders", folders);
