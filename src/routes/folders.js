const router = require("express").Router();
const Item = require("../database/schemas/itemSchema.js");
const verifyToken = require("../middleware/verifyToken.js");

router.get("/fetch", async (req, res) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/create", verifyToken, async (req, res) => {
  const body = req.body;
  try {
    if (body) {
      const folder = await Item.create({
        type: "folder",
        name: body.name,
        size: "0",
        total_files: "0",
        access_control: [],
        owner_id: req.userId,
        parent_folder: body.parent_folder,
        path: body.path,
      });
      res.send(folder);
    } else {
      res.status(400).send({ message: "No data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

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
