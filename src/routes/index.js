const router = require("express").Router();
const folders = require("./folders");

router.use("/folders", folders);

router.get("*", (req, res) => {
  res.status(404).send({
    message: "Not Found",
  });
});

module.exports = router;
