const router = require("express").Router();
const Folders = require("../database/schemas/Folders.js");

router.get("/fetch", async (req, res) => {
  const folders = await Folders.find();
  res.send(folders);
});

module.exports = router;
