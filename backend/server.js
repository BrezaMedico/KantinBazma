const express = require("express");
const cors = require("cors");

require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/foods", foodRoutes);
app.use("/api/purchases", purchaseRoutes);

app.get("/", (req, res) => {
  res.send("API berjalan");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});