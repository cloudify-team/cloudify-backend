const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Types.ObjectId,
      auto: true,
    },
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: function () {
        return this.type === "file";
      },
    },
    size: {
      type: String,
    },
    total_files: {
      type: String,
      required: function () {
        return this.type === "folder";
      },
    },
    access_control: {
      type: Array,
    },
    owner_id: {
      type: String,
      required: function () {
        return this.type === "folder";
      },
    },
    parent_folder: {
      type: String,
      required: false,
    },
    path: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Item", itemSchema);
