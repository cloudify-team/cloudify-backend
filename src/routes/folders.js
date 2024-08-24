const router = require("express").Router();
const Folders = require("../database/schemas/Folders.js");

router.get("/fetch", async (req, res) => {
  try {
    const folders = await Folders.find();
    res.send(folders);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post("/create", async (req, res) => {
  const body = req.body;
  try {
    if (body) {
      const folders = await Folders.create({
        total_files: "0",
        name: body.name,
        size: "0",
        access_control: [],
        owner_id: body.owner_id,
        parent_folder: body.parent_folder,
      });
      res.send(folders);
    } else {
      res.status(400).send({ message: "No data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

router.post("/edit", async (req, res) => {
  const body = req.body;
  try {
    if (body) {
      const folders = await Folders.findOneAndUpdate(
        { _id: body._id }, // Find the document with this _id
        {
          $set: {
            name: body.name,
            access_control: body.access_control,
            parent_folder: body.parent_folder,
          },
        },
        { new: true } // Return the updated document
      );
      res.send(folders);
    } else {
      res.status(400).send({ message: "No data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

router.post("/delete", async (req, res) => {
  const body = req.body;
  try {
    if (body) {
      const folders = await Folders.createfindByIdAndDelete({
        _id: body._id,
      });
      // anathe contents del akkanam
      res.send(folders);
    } else {
      res.status(400).send({ message: "No data provided" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating folder", error: error.message });
  }
});

router.post("/upload", async (req, res) => {
  const body = req.body;
  try {
    // handle uploading
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error uploading files", error: error.message });
  }
});

module.exports = router;
