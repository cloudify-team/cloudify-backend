const router = require("express").Router();
const folders = require("./folders");
const files = require("./files");
const accounts = require("./accounts");

router.use("/folders", folders);
router.use("/files", files);
router.use("/accounts", accounts);

router.get("*", (req, res) => {
  res.status(404).send({
    message: "Not Found",
  });
});

module.exports = router;
