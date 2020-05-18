const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("API is up");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server has started on port:${PORT}`));
