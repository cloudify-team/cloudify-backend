const router = require("express").Router();
const user = require("./folders");

router.use("/folders", user);

router.get("*", (req, res) => {
  res.status(404).send({
    message: "Not Found",
  });
});

module.exports = router;
