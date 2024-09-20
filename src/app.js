require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3001;
const routes = require("./routes");
const logger = require("morgan");

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "..", "public")));

mongoose.connect(process.env.MONGO_CONNECTION_URL).catch((err) => {
  console.log(err);
});

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", /^https:\/\/.*\.cloudify-6x8\.pages\.dev$/],
    credentials: true,
  }),
);

app.use("/api/v1", routes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
