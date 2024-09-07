const router = require("express").Router();
const Item = require("../../database/schemas/itemSchema.js");

router.get("/fetch", async (req, res) => {
  try {
    const items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
