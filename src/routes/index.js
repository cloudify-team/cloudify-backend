const router = require("express").Router();
const user = require("./folders");

router.use("/folders", user);

module.exports = router;
