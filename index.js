const express = require("express");

const drugRoute = require("./routes/drugs");

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api", drugRoute);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
