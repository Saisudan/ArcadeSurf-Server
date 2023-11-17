require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT;
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.send("<p>Server is running</p>")
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
