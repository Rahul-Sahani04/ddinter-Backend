const express = require("express");

const drugRoute = require("./routes/drugs");

const app = express();
const port = 3000;

// use cors
const cors = require("cors");
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

app.use("/api", drugRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;