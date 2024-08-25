require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;
const routes = require("./routes");

app.use(express.static(path.join(__dirname, "..", "public")));

mongoose
  .connect("mongodb+srv://api:Loiwsa9Ak0e6Eyb8@hafis.xwea2.mongodb.net/cloud", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", /^https:\/\/.*\.cloud-5tx\.pages\.dev$/],
    credentials: true,
  })
);

app.use("/api/v1", routes);

app.get("*", (req, res) => {
  res.status(404).send({
    message: "Not Found",
  });
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
