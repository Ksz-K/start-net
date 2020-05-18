const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const app = express();

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect DB from Cloud
connectDB();

app.get("/", (req, res) => {
  res.send("API is up");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server has started on port:${PORT}`));
